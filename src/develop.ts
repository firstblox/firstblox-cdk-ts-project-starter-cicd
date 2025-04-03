import { App } from "aws-cdk-lib";
import { StatefulStack } from "./app/stateful/stateful.stack";
import { StatelessStack } from "./app/stateless/stateless.stack";
import { environments } from "./config";

const app = new App();

const statefulStack = new StatefulStack(app, "stateful-stack", {
  env: {
    region: environments.develop.env.region,
    account: environments.develop.env.account,
  },
  bucketName: environments.develop.stateful.bucketName,
});

new StatelessStack(app, "stateless-stack", {
  env: {
    region: environments.develop.env.region,
    account: environments.develop.env.account,
  },
  table: statefulStack.table,
  bucket: statefulStack.bucket,
  lambdaMemorySize: environments.develop.stateless.lambdaMemorySize,
  stageName: environments.develop.stageName,
});
