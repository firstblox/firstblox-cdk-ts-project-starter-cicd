import { pipelines } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export const fetchAccountsStep = (
  input: pipelines.CodePipelineSource,
  region: string,
) => {
  return new pipelines.CodeBuildStep("fetch-accounts", {
    rolePolicyStatements: [
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: ["*"],
      }),
    ],
    input,
    commands: [
      "npm install -g pnpm",
      "pnpm i",
      `pnpm fetch-accounts --region ${region}`,
      "mkdir -p output",
      "cp .env output/",
    ],
    primaryOutputDirectory: "output",
  });
};
