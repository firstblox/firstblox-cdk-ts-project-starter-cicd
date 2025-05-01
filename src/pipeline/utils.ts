import { pipelines } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export const fetchAccountsStep = (
  input: pipelines.CodePipelineSource,
  region: string,
) => {
  const fetchAccountsStep = new pipelines.CodeBuildStep("fetch-accounts", {
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
      `node src/scripts/fetch-accounts.js --region ${region}`,
    ],
    primaryOutputDirectory: ".",
  });

  return fetchAccountsStep;
};
