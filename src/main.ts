import * as cdk from "aws-cdk-lib";
import { pipelineConfig, PROJECT_NAME } from "./config/config";
import { PipelineStack } from "./pipeline/pipeline.stack";

const app = new cdk.App();

new PipelineStack(app, `${PROJECT_NAME}-pipeline`, {
  env: {
    account: pipelineConfig.env.account,
    region: pipelineConfig.env.region,
  },
  pipelineName: pipelineConfig.pipelineName,
  useChangeSets: pipelineConfig.useChangeSets,
  selfMutation: pipelineConfig.selfMutation,
  github: {
    owner: pipelineConfig.github.owner,
    repository: pipelineConfig.github.repository,
    branch: pipelineConfig.github.branch,
  },
});

app.synth();
