import { awscdk } from "projen";
import { NodePackageManager } from "projen/lib/javascript";

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "firstblox-cdk-ts-project-starter-cicd",
  projenrcTs: true,
  packageManager: NodePackageManager.NPM,
  jest: false,
  eslint: true,
  prettier: true,
  deps: [
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/client-s3",
    "@types/aws-lambda",
    "aws-lambda",
    "aws-sdk",
    "dotenv",
    "uuid",
  ],
  devDeps: ["@types/uuid", "@types/node", "ts-node", "tsconfig-paths"],
  context: {
    "@aws-cdk/customresources:installLatestAwsSdkDefault": false,
  },
});

project.gitignore.exclude(
  ".env",
  "tmp",
  "cdk.context.json",
  "cdk.out/",
  "cdk.develop.out/",
  "cdk-outputs.json",
);

project.addTask("develop", {
  exec: 'npx cdk --output cdk.develop.out --app "npx ts-node -P tsconfig.json --prefer-ts-exts src/develop.ts"',
  receiveArgs: true,
});

project.synth();
