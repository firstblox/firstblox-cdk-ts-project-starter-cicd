import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codestarconnections from "aws-cdk-lib/aws-codestarconnections";
import * as iam from "aws-cdk-lib/aws-iam";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { environments } from "../../config";
import { PipelineStage } from "../stage/pipeline.stage";

export interface PipelineStackProps extends cdk.StackProps {
  codeStarConnectionName: string;
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
  public readonly codestarConnection: codestarconnections.CfnConnection;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    this.codestarConnection = new codestarconnections.CfnConnection(
      this,
      "codestar-connection",
      {
        connectionName: props.codeStarConnectionName,
        providerType: "GitHub",
      },
    );

    const sourceAction = pipelines.CodePipelineSource.connection(
      `${props.github.owner}/${props.github.repository}`,
      props.github.branch,
      {
        connectionArn: this.codestarConnection.attrConnectionArn,
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
        commands: ["npm ci", "npm run build", `npx projen synth`],
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          computeType: codebuild.ComputeType.MEDIUM,
          environmentVariables: {},
        },
      }),
    });

    new PipelineStage(this, `Dev`, {
      ...environments.dev,
    });

    const stagingStage: PipelineStage = new PipelineStage(this, "Stage", {
      ...environments.staging,
    });
    pipeline.addStage(stagingStage, {
      pre: [new pipelines.ManualApprovalStep("PromoteToStage")],
    });

    const prodStage: PipelineStage = new PipelineStage(this, "Prod", {
      ...environments.prod,
    });
    pipeline.addStage(prodStage, {
      pre: [new pipelines.ManualApprovalStep("PromoteToProd")],
    });
  }
}
