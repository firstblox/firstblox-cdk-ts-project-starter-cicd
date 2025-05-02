import { awscdk, TextFile } from "projen";

const envs = [
  { env: "ACCOUNT_ID_PIPELINE", ssm: "/accountId/pipeline", key: "pipeline" },
  { env: "ACCOUNT_ID_DEV", ssm: "/accountId/dev", key: "dev" },
  { env: "ACCOUNT_ID_QA", ssm: "/accountId/qa", key: "qa" },
  { env: "ACCOUNT_ID_STAGING", ssm: "/accountId/staging", key: "staging" },
  { env: "ACCOUNT_ID_PROD", ssm: "/accountId/prod", key: "prod" },
];

export const GENERATED_ACCOUNT_IDS_FILE = "src/config/account-ids.ts";

export const generateAccountIdConfig = (project: awscdk.AwsCdkTypeScriptApp) => {
  const lines = [
    "export const accountParams = [",
    ...envs.map((e) => `  { env: '${e.env}', ssm: '${e.ssm}' },`),
    "];",
    "",
    "export interface AccountId {",
    ...envs.map((e) => `  ${e.key}: string;`),
    "}",
  ];

  new TextFile(project, GENERATED_ACCOUNT_IDS_FILE, {
    marker: true,
    readonly: false,
    lines,
  });
};
