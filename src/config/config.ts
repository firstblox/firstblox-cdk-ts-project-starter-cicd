import * as dotenv from "dotenv";
import {
  AccountId,
  EnvironmentConfig,
  Region,
  Stage,
  PipelineConfig,
} from "./types";

dotenv.config();

export const PROJECT_NAME = "firstblox-cdk-ts-project-starter-cicd";

export const accountIds: AccountId = {
  pipeline: process.env.ACCOUNT_ID_PIPELINE || "",
  dev: process.env.ACCOUNT_ID_DEV || "",
  qa: process.env.ACCOUNT_ID_QA || "",
  staging: process.env.ACCOUNT_ID_STAGING || "",
  prod: process.env.ACCOUNT_ID_PROD || "",
};

export const pipelineConfig: PipelineConfig = {
  env: {
    account: accountIds.pipeline,
    region: Region.dublin,
  },
  github: {
    owner: "firstblox",
    repository: "firstblox-cdk-ts-project-starter-cicd",
    branch: "main",
  },
  codeStarConnectionName: "project-starter-connection",
  pipelineName: `${PROJECT_NAME}-pipeline`,
  dynamicAccounts: true,
  useChangeSets: true,
  selfMutation: true,
};

export const environments: Record<Stage, EnvironmentConfig> = {
  [Stage.featureDev]: {
    env: {
      account:
        process.env.TARGET_ACCOUNT_ID ||
        (process.env.CDK_DEFAULT_ACCOUNT as string),
      region:
        process.env.TARGET_REGION || (process.env.CDK_DEFAULT_REGION as string),
    },
    stateful: {
      tableName: `${PROJECT_NAME}-${process.env.STAGE}-table`.toLowerCase(),
      bucketName: `${PROJECT_NAME}-${process.env.STAGE}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: process.env.STAGE || Stage.featureDev,
  },
  [Stage.dev]: {
    env: {
      account: accountIds.dev,
      region: Region.virginia,
    },
    stateful: {
      tableName: `${PROJECT_NAME}-${Stage.dev}-table`.toLowerCase(),
      bucketName: `${PROJECT_NAME}-${Stage.dev}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: Stage.dev,
  },
  [Stage.qa]: {
    env: {
      account: accountIds.qa,
      region: Region.virginia,
    },
    stateful: {
      tableName: `${PROJECT_NAME}-${Stage.dev}-table`.toLowerCase(),
      bucketName: `${PROJECT_NAME}-${Stage.dev}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: Stage.dev,
  },
  [Stage.staging]: {
    env: {
      account: accountIds.staging,
      region: Region.virginia,
    },
    stateful: {
      tableName: `${PROJECT_NAME}-${Stage.staging}-table`.toLowerCase(),
      bucketName: `${PROJECT_NAME}-${Stage.staging}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: Stage.staging,
  },
  [Stage.prod]: {
    env: {
      account: accountIds.prod,
      region: Region.virginia,
    },
    stateful: {
      tableName: `${PROJECT_NAME}-${Stage.prod}-table`.toLowerCase(),
      bucketName: `${PROJECT_NAME}-${Stage.prod}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: Stage.prod,
  },
};
