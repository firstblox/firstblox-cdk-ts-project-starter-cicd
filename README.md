firstblox-cdk-ts-project-starter-cicd
-------------------------------------

# Table of Contents

[Overview](#overview)

[Architecture](#architecture)

[Deployment](#deployment)

# Overview

![Title](docs/images/title-card.png)

> [!NOTE]
> This codebase utilises concepts and reference code from the excellent series by Lee Gilmore on CDK pipelines best practices.
> See part 1 [here](https://github.com/leegilmorecode/Serverless-AWS-CDK-Best-Practices-Patterns).
> I highly recommend you checkout the whole series.

> [!IMPORTANT]
> This codebase is currently a reference repository ONLY.
> Developers should customise to their environment and requirements.
> See `src/config.ts` for all configurations

**Whats included?**

- Projen CDK TS project scaffolding.
- Seperate develop app to facilitate development.
- Pipeline stack, stage and configuration.
- Stateful and stateless example stacks.
- Configuration file for all application configurations.
- Auto generation of deployment stages via CDK pipelines.

**Pre-requisites**

- CDK CLI installed.
- Projen installed.
- AWS account CDK bootstrapped.
- Sufficient credentials to perform deployment from local.

# Install

```bash
npm i
```

# Configure

## Projen

To configure the project and project dependencies please modify `.projenrc` ONLY.

A good rule of thumb:

- Utilise projenrc in all cases where projen supports a configuration action/type.
- Apply a manual addition/change in cases where projen does not support a configuration action/type or it cannot be customised through projen.

Once configuration changes are made via `.projenrc` run the below command.

```bash
npx projen
```

## config.ts

To prepare your codebase for deployment modify configurations in [config.ts](./src/config.ts).

The Account enum will need be updated to specify your own AWS account ids.

E.g.

```typescript
export const enum Account {
  pipeline = "111111111111",
  dev = "22222222222",
  staging = "33333333333333",
  prod = "44444444444444",
}
```

# Development

## Configure

Create a `.env` file at the root of the project with the following configurations.

```bash
TARGET_ACCOUNT_ID=XXXXXXXXXXXX
TARGET_REGION=eu-west-1
STAGE=lof
```

## Synth

```bash
npx projen develop synth
```

## Deploy

```bash
npx projen develop deploy --all
```

# CICD

## Synth


```bash
npx projen synth
```

## Deploy

**Note: This main application entry point deploys the CICD pipeline stack which subsequently deploys the application stacks via the pipeline.**

```bash
npx projen deploy
```

## Destroy

```bash
npx projen destroy
```

## Approvals

**Note: The deployment may have manual approval stages. Ensure to approve the deployment at that stage if so.**

Manual approvals are configured in [pipeline.stack.ts](./src/pipeline/stack/pipeline.stack.ts) as follows

```typescript
const stagingStage: PipelineStage = new PipelineStage(this, "Stage", {
  ...environments.staging,
});
pipeline.addStage(stagingStage, {
  pre: [new pipelines.ManualApprovalStep("PromoteToStage")],
});
```

## Pipeline Output

Once deployed your new CodePipeline should look something like the following.

![Title](docs/images/pipeline-output.png)