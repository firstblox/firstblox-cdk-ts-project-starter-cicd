export interface EnvironmentConfig {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
  stateful: {
    bucketName: string;
  };
  stateless: {
    lambdaMemorySize: number;
  };
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
  codeStarConnectionName: string;
  pipelineName: string;
  useChangeSets: boolean;
  selfMutation: boolean;
}

export const enum Region {
  virginia = "us-east-1",
  dublin = "eu-west-1",
  london = "eu-west-2",
  frankfurt = "eu-central-1",
}

export const enum Stage {
  dev = "dev",
  staging = "staging",
  prod = "prod",
  develop = "develop",
}
