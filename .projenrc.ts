import { awscdk, TextFile } from "projen";
import {
  NodePackageManager,
  UpgradeDependenciesSchedule,
} from "projen/lib/javascript";

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "firstblox-cdk-ts-project-starter-cicd",
  projenrcTs: true,
  packageManager: NodePackageManager.PNPM,
  jest: false,
  eslint: true,
  prettier: true,
  deps: [
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/client-s3",
    "@aws-sdk/client-ssm",
    "@aws-sdk/credential-provider-env",
    "@types/aws-lambda",
    "aws-lambda",
    "aws-sdk",
    "commander",
    "dotenv",
    "uuid",
  ],
  devDeps: ["@types/uuid", "@types/node", "husky", "ts-node", "tsconfig-paths"],
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
  context: {
    "@aws-cdk/customresources:installLatestAwsSdkDefault": false,
  },
});

project.package.addField('scripts', {
  prepare: 'husky install',
});

project.postCompileTask.exec("husky install");
project.postCompileTask.exec(
  "npx husky add .husky/pre-commit 'npx projen eslint'"
);

project.github?.mergify?.addRule({
  name: 'Auto-merge Projen upgrade PRs',
  conditions: [
    'author=github-actions[bot]',
    'title~^chore\\(deps\\): upgrade dependencies',
    'label=auto-approve',
    'check-success=build',
  ],
  actions: {
    review: {
      type: 'APPROVE',
    },
    merge: {
      method: "squash",
    },
  },
});


project.gitignore.exclude(
  ".env",
  "tmp",
  "cdk.context.json",
  "cdk.out/",
  "cdk.develop.out/",
  "cdk.feature-dev.out/",
  "cdk.hotfix.out/",
  "cdk-outputs.json",
);

project.addTask("develop", {
  exec: 'npx cdk --output cdk.develop.out --app "npx ts-node -P tsconfig.json --prefer-ts-exts src/develop.ts"',
  receiveArgs: true,
});

project.addTask("feature-dev", {
  exec: 'npx cdk --output cdk.feature-dev.out --app "npx ts-node -P tsconfig.json --prefer-ts-exts src/feature-dev.ts"',
  receiveArgs: true,
});

project.addTask("fetch-accounts", {
  exec: "ts-node src/scripts/fetch-accounts.ts",
  receiveArgs: true,
});

const envs = [
  { env: "ACCOUNT_ID_PIPELINE", ssm: "/accountId/pipeline", key: "pipeline" },
  { env: "ACCOUNT_ID_DEV", ssm: "/accountId/dev", key: "dev" },
  { env: "ACCOUNT_ID_QA", ssm: "/accountId/qa", key: "qa" },
  { env: "ACCOUNT_ID_STAGING", ssm: "/accountId/staging", key: "staging" },
  { env: "ACCOUNT_ID_PROD", ssm: "/accountId/prod", key: "prod" },
];

const lines = [
  "export const accountParams = [",
  ...envs.map((e) => `  { env: '${e.env}', ssm: '${e.ssm}' },`),
  "];",
  "",
  "export interface AccountId {",
  ...envs.map((e) => `  ${e.key}: string;`),
  "}",
];

new TextFile(project, "src/config/ssm-account-ids.ts", {
  marker: true,
  readonly: false,
  lines,
});

project.synth();
