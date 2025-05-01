export interface EnvironmentConfig {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
  tableName: string;
  bucketName: string;
  lambdaMemorySize: number;
}

export interface PipelineConfig {
  env: {
    account: string;
    region: string;
  };
  github: {
    owner: string;
    repository: string;
    branch: string;
  };
  pipelineName: string;
  dynamicAccounts?: boolean;
  useChangeSets?: boolean;
  selfMutation?: boolean;
  ssmParameterNameCodeStarConnection?: string;
  codeStarConnectionName?: string;
}

export interface AccountId {
  pipeline: string;
  dev: string;
  qa: string;
  staging: string;
  prod: string;
}

export const enum Region {
  virginia = "us-east-1",
  dublin = "eu-west-1",
  london = "eu-west-2",
  frankfurt = "eu-central-1",
}

export const enum Stage {
  featureDev = "feature-dev",
  dev = "dev",
  qa = "qa",
  staging = "staging",
  prod = "prod",
}
