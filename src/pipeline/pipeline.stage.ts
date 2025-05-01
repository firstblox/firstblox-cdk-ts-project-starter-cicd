import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StatefulStack } from "../app/stacks/stateful.stack";
import { StatelessStack } from "../app/stacks/stateless.stack";
import { PROJECT_NAME } from "../config/config";
import { EnvironmentConfig } from "../config/types";

export class PipelineStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(
      this,
      `${PROJECT_NAME}-stateful-${props.stageName}`,
      {
        env: props.env,
        tableName: props.stateful.tableName,
        bucketName: props.stateful.bucketName,
        tags: {
          Environment: props.stageName,
        },
      },
    );

    new StatelessStack(this, `${PROJECT_NAME}-stateless-${props.stageName}`, {
      env: props.env,
      table: statefulStack.table,
      bucket: statefulStack.bucket,
      stageName: props.stageName,
      lambdaMemorySize: props.stateless.lambdaMemorySize,
      tags: {
        Environment: props.stageName,
      },
    });
  }
}
