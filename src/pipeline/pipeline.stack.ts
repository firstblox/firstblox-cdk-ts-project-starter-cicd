import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import * as codestarconnections from "aws-cdk-lib/aws-codestarconnections";
import { PipelineStage } from "./pipeline.stage";
import { environments } from "../config/config";

export interface PipelineStackProps extends cdk.StackProps {
  ssmParameterNameCodeStarConnection?: string;
  codeStarConnectionName?: string;
  pipelineName: string;
  useChangeSets: boolean;
  selfMutation: boolean;
  github: {
    owner: string;
    repository: string;
    branch: string;
  };
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    let codestarConnectionArn: string;
    const codeStarConnectionName = props.codeStarConnectionName || "codestar-connection";

    if (props.ssmParameterNameCodeStarConnection) {
      codestarConnectionArn = ssm.StringParameter.valueFromLookup(
        this,
        props.ssmParameterNameCodeStarConnection,
      );
    } else {
      const codestarConnection = new codestarconnections.CfnConnection(
        this,
        "codestar-connection",
        {
          connectionName: codeStarConnectionName,
          providerType: "GitHub",
        },
      );
      codestarConnectionArn = codestarConnection.attrConnectionArn;
    }
    const sourceAction = pipelines.CodePipelineSource.connection(
      `${props.github.owner}/${props.github.repository}`,
      props.github.branch,
      {
        triggerOnPush: true,
        connectionArn: codestarConnectionArn,
      },
    );

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      pipelineName: props.pipelineName ? `${props.pipelineName}` : undefined,
      useChangeSets: props.useChangeSets,
      crossAccountKeys: true,
      selfMutation: props.selfMutation,
      synthCodeBuildDefaults: {
        rolePolicy: [
          new iam.PolicyStatement({
            conditions: {
              "ForAnyValue:StringEquals": {
                "iam:ResourceTag/aws-cdk:bootstrap-role": ["lookup"],
              },
            },
            actions: ["sts:AssumeRole"],
            resources: ["arn:*:iam::*:role/*"],
          }),
        ],
      },
      synth: new pipelines.CodeBuildStep("synth", {
        input: sourceAction,
        commands: [
          "npm install -g pnpm",
          "pnpm i",
          "pnpm run build",
          `npx projen synth`,
        ],
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          computeType: codebuild.ComputeType.MEDIUM,
          environmentVariables: {},
        },
      }),
    });

    const stagingStage: PipelineStage = new PipelineStage(this, "Stage", {
      ...environments.staging,
    });
    pipeline.addStage(stagingStage);

    const prodStage: PipelineStage = new PipelineStage(this, "Prod", {
      ...environments.prod,
    });
    pipeline.addStage(prodStage, {
      pre: [new pipelines.ManualApprovalStep("PromoteToProd")],
    });
  }
}
