#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { StatefulStack } from "./app/stacks/stateful.stack";
import { StatelessStack } from "./app/stacks/stateless.stack";
import { environments, PROJECT_NAME } from "./config";
import { Stage } from "./config/types";

dotenv.config();

const app = new cdk.App();

const stage = process.env.STAGE;

if (!stage) {
  console.error("❌ ERROR: STAGE environment variable is not set");
  process.exit(1);
}

const statefulStack = new StatefulStack(
  app,
  `${PROJECT_NAME}-stateful-${stage}`,
  {
    env: environments[Stage.featureDev].env,
    tableName: environments[Stage.featureDev].tableName,
    bucketName: environments[Stage.featureDev].bucketName,
    tags: {
      Environment: stage,
    },
  },
);

new StatelessStack(app, `${PROJECT_NAME}-stateless-${stage}`, {
  env: environments[Stage.featureDev].env,
  table: statefulStack.table,
  bucket: statefulStack.bucket,
  stageName: stage,
  lambdaMemorySize: 1024,
  tags: {
    Environment: stage,
  },
});

app.synth();
