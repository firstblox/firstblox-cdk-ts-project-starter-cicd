#!/usr/bin/env ts-node

import fs from "fs";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { Command } from "commander";
import { accountParams } from "../config/account-ids";

const program = new Command();
program
  .option("--region <region>", "AWS region to use", "eu-west-1")
  .parse(process.argv);

const options = program.opts() as { region: string };

function isRunningInCodeBuild(): boolean {
  return !!process.env.CODEBUILD_BUILD_ID;
}

/**
 * @param {string} region
 */
async function createSSMClient(region: string): Promise<SSMClient> {
  try {
    return new SSMClient({
      region,
      ...(isRunningInCodeBuild() ? {} : { credentials: fromEnv() }),
    });
  } catch (error) {
    const err = error as Error;
    if (
      err.message.includes("No SSO sessions found") ||
      err.message.includes(
        "SSO session associated with this profile has expired",
      )
    ) {
      console.error("\nError: AWS SSO session is expired or not found");
      console.error('Please run "aws sso login" and try again\n');
    } else {
      console.error(
        "\nError: Failed to create SSM client with your current aws profile",
      );
      console.error(`Details: ${err.message}\n`);
    }
    throw err;
  }
}

/**
 * @param {SSMClient} ssm
 * @param {string} ssmName
 * @returns {Promise<string>}
 */
async function fetchAccountId(
  ssm: SSMClient,
  ssmName: string,
): Promise<string> {
  try {
    const param = await ssm.send(
      new GetParameterCommand({
        Name: ssmName,
        WithDecryption: true,
      }),
    );
    const value = param.Parameter && param.Parameter.Value;
    return value ?? "";
  } catch (err) {
    const error = err as Error & { name?: string };
    if (error.name === "ParameterNotFound") {
      return "";
    }
    throw error;
  }
}

/**
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  const ssm = await createSSMClient(options.region);
  const lines: string[] = [];

  for (const { env, ssm: ssmName } of accountParams) {
    const value = await fetchAccountId(ssm, ssmName);
    if (value) {
      lines.push(`${env}=${value}`);
    }
  }

  if (lines.length > 0) {
    fs.writeFileSync(".env", lines.join("\n"));
    console.log(`✅ Account IDs written to .env (region: ${options.region})`);
  } else {
    console.log(
      `⚠️  No account IDs found in SSM in region ${options.region}, .env not written.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
