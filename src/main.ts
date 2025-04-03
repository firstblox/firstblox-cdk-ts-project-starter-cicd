import { App } from "aws-cdk-lib";
import { pipelineConfig } from "./config";
import { PipelineStack } from "./pipeline/stack/pipeline.stack";

const app = new App();

new PipelineStack(app, "pipeline-stack", {
  env: {
    region: pipelineConfig.env.region,
    account: pipelineConfig.env.account,
  },
  codeStarConnectionName: pipelineConfig.codeStarConnectionName,
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
