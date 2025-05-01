import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { pipelineConfig, PROJECT_NAME } from "./config/config";
import { DevPipelineStack } from "./pipeline/dev-pipeline.stack";

dotenv.config();

const app = new cdk.App();

new DevPipelineStack(app, `${PROJECT_NAME}-pipeline-dev`, {
  env: {
    account: pipelineConfig.env.account,
    region: pipelineConfig.env.region,
  },
  ssmParameterNameCodeStarConnection:
    pipelineConfig.ssmParameterNameCodeStarConnection,
  pipelineName: `${PROJECT_NAME}-pipeline-dev`,
  useChangeSets: pipelineConfig.useChangeSets,
  selfMutation: pipelineConfig.selfMutation,
  github: {
    owner: pipelineConfig.github.owner,
    repository: pipelineConfig.github.repository,
    branch: "develop",
  },
});

app.synth();
