import * as cdk from "aws-cdk-lib";
import { pipelineConfig, PROJECT_NAME } from "./config";
import { DevPipelineStack } from "./pipeline/dev-pipeline.stack";

const app = new cdk.App();

new DevPipelineStack(app, `${PROJECT_NAME}-pipeline-dev`, {
  env: {
    account: pipelineConfig.env.account,
    region: pipelineConfig.env.region,
  },
  pipelineName: `${PROJECT_NAME}-pipeline-dev`,
  dynamicAccounts: pipelineConfig.dynamicAccounts,
  useChangeSets: pipelineConfig.useChangeSets,
  selfMutation: pipelineConfig.selfMutation,
  github: {
    owner: pipelineConfig.github.owner,
    repository: pipelineConfig.github.repository,
    branch: "develop",
  },
});

app.synth();
