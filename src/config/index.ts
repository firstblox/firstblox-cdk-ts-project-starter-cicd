import * as dotenv from "dotenv";
import {
  EnvironmentConfig,
  Region,
  Stage,
  PipelineConfig,
} from "./types";
import { AccountId } from "./account-ids";

dotenv.config();

export const PROJECT_NAME = "firstblox-cdk-ts-project-starter-cicd";

export const accountIdConfig: AccountId = {
  pipeline: process.env.ACCOUNT_ID_PIPELINE || "",
  dev: process.env.ACCOUNT_ID_DEV || "",
  qa: process.env.ACCOUNT_ID_QA || "",
  staging: process.env.ACCOUNT_ID_STAGING || "",
  prod: process.env.ACCOUNT_ID_PROD || "",
};

export const pipelineConfig: PipelineConfig = {
  env: {
    account: accountIdConfig.pipeline,
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
    tableName: `${PROJECT_NAME}-${process.env.STAGE}-table`.toLowerCase(),
    bucketName: `${PROJECT_NAME}-${process.env.STAGE}-bucket`.toLowerCase(),
    lambdaMemorySize: 1024,
    stageName: process.env.STAGE || Stage.featureDev,
  },
  [Stage.dev]: {
    env: {
      account: accountIdConfig.dev,
      region: Region.virginia,
    },
    tableName: `${PROJECT_NAME}-${Stage.dev}-table`.toLowerCase(),
    bucketName: `${PROJECT_NAME}-${Stage.dev}-bucket`.toLowerCase(),
    lambdaMemorySize: 1024,
    stageName: Stage.dev,
  },
  [Stage.qa]: {
    env: {
      account: accountIdConfig.qa,
      region: Region.virginia,
    },
    tableName: `${PROJECT_NAME}-${Stage.dev}-table`.toLowerCase(),
    bucketName: `${PROJECT_NAME}-${Stage.dev}-bucket`.toLowerCase(),
    lambdaMemorySize: 1024,
    stageName: Stage.dev,
  },
  [Stage.staging]: {
    env: {
      account: accountIdConfig.staging,
      region: Region.virginia,
    },
    tableName: `${PROJECT_NAME}-${Stage.staging}-table`.toLowerCase(),
    bucketName: `${PROJECT_NAME}-${Stage.staging}-bucket`.toLowerCase(),
    lambdaMemorySize: 1024,
    stageName: Stage.staging,
  },
  [Stage.prod]: {
    env: {
      account: accountIdConfig.prod,
      region: Region.virginia,
    },
    tableName: `${PROJECT_NAME}-${Stage.prod}-table`.toLowerCase(),
    bucketName: `${PROJECT_NAME}-${Stage.prod}-bucket`.toLowerCase(),
    lambdaMemorySize: 1024,
    stageName: Stage.prod,
  },
};
