import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { StatefulStack } from "../../app/stateful/stateful.stack";
import { StatelessStack } from "../../app/stateless/stateless.stack";
import { EnvironmentConfig } from "../../types";

export class PipelineStage extends cdk.Stage {
  public readonly apiEndpointUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(this, "StatefulStack", {
      bucketName: props.stateful.bucketName,
    });

    const statelessStack = new StatelessStack(this, "StatelessStack", {
      env: {
        account: props.env.account,
        region: props.env.region,
      },
      table: statefulStack.table,
      bucket: statefulStack.bucket,
      lambdaMemorySize: props.stateless.lambdaMemorySize,
      stageName: props.stageName,
    });

    this.apiEndpointUrl = statelessStack.apiEndpointUrl;
  }
}
