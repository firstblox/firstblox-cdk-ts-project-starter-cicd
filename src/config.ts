import * as dotenv from "dotenv";

import { EnvironmentConfig, PipelineConfig, Region, Stage } from "./types";

dotenv.config();

export const enum Account {
  pipeline = "111111111111",
  dev = "222222222222",
  staging = "333333333333",
  prod = "444444444444",
}

export const pipelineConfig: PipelineConfig = {
  env: {
    account: Account.pipeline,
    region: Region.dublin,
  },
  github: {
    owner: "firstblox",
    repository: "firstblox-cdk-ts-project-starter-cicd",
    branch: "main",
  },
  codeStarConnectionName: "firstblox-codestar-connection",
  pipelineName: "firstblox-cdk-ts-project-starter-cicd-pipeline",
  useChangeSets: true,
  selfMutation: true,
};

export const environments: Record<Stage, EnvironmentConfig> = {
  [Stage.develop]: {
    env: {
      account:
        process.env.TARGET_ACCOUNT_ID || (process.env.CDK_DEFAULT_ACCOUNT as string),
      region: process.env.TARGET_REGION || (process.env.CDK_DEFAULT_REGION as string),
    },
    stateful: {
      bucketName:
        `firstblox-cdk-ts-project-starter-cicd-${process.env.STAGE}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: parseInt(process.env.LAMBDA_MEM_SIZE || "128"),
    },
    stageName: process.env.STAGE || Stage.develop,
  },
  [Stage.dev]: {
    env: {
      account: Account.dev,
      region: Region.dublin,
    },
    stateful: {
      bucketName: "firstblox-cdk-ts-project-starter-cicd-feature-dev-bucket",
    },
    stateless: {
      lambdaMemorySize: 128,
    },
    stageName: Stage.dev,
  },
  [Stage.staging]: {
    env: {
      account: Account.staging,
      region: Region.dublin,
    },
    stateful: {
      bucketName: "firstblox-cdk-ts-project-starter-cicd-staging-bucket",
    },
    stateless: {
      lambdaMemorySize: 512,
    },
    stageName: Stage.staging,
  },
  [Stage.prod]: {
    env: {
      account: Account.prod,
      region: Region.dublin,
    },
    stateful: {
      bucketName: "firstblox-cdk-ts-project-starter-cicd-prod-bucket",
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: Stage.prod,
  },
};
