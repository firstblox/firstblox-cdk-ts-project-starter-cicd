import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StatefulStack } from "../stacks/stateful.stack";
import { StatelessStack } from "../stacks/stateless.stack";
import { PROJECT_NAME } from "../../config/config";
import { EnvironmentConfig } from "../../config/types";

export class ApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(
      this,
      `${PROJECT_NAME}-stateful-${props.stageName}`,
      {
        env: props.env,
        tableName: props.tableName,
        bucketName: props.bucketName,
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
      lambdaMemorySize: props.lambdaMemorySize,
      tags: {
        Environment: props.stageName,
      },
    });
  }
}
