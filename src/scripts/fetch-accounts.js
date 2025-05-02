// scripts/fetch-accounts.js
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const fs = require('fs');
const { fromEnv } = require('@aws-sdk/credential-provider-env');
const { Command } = require('commander');

const accountParams = [
  { env: 'ACCOUNT_ID_PIPELINE', ssm: '/accountId/pipeline' },
  { env: 'ACCOUNT_ID_DEV',      ssm: '/accountId/dev' },
  { env: 'ACCOUNT_ID_QA',       ssm: '/accountId/qa' },
  { env: 'ACCOUNT_ID_STAGING',  ssm: '/accountId/staging' },
  { env: 'ACCOUNT_ID_PROD',     ssm: '/accountId/prod' },
];

const program = new Command();
program
  .option('--region <region>', 'AWS region to use', 'eu-west-1')
  .parse(process.argv);

const options = program.opts();

function isRunningInCodeBuild() {
  return !!process.env.CODEBUILD_BUILD_ID;
}

async function createSSMClient(region) {
  try {
    return new SSMClient({
      region,
      ...(isRunningInCodeBuild() ? {} : { credentials: fromEnv() }),
    });
  } catch (error) {
    if (
      error.message.includes('No SSO sessions found') ||
      error.message.includes('SSO session associated with this profile has expired')
    ) {
      console.error('\nError: AWS SSO session is expired or not found');
      console.error('Please run "aws sso login" and try again\n');
    } else {
      console.error('\nError: Failed to create SSM client with your current aws profile');
      console.error(`Details: ${error.message}\n`);
    }
    throw error;
  }
}

async function fetchAccountId(ssm, ssmName) {
  try {
    const param = await ssm.send(new GetParameterCommand({
      Name: ssmName,
      WithDecryption: true,
    }));
    return param.Parameter.Value;
  } catch (err) {
    if (err.name === 'ParameterNotFound') {
      return undefined;
    }
    throw err;
  }
}

async function main() {
  const ssm = await createSSMClient(options.region);
  const lines = [];

  for (const { env, ssm: ssmName } of accountParams) {
    const value = await fetchAccountId(ssm, ssmName);
    if (value) {
      lines.push(`${env}=${value}`);
    }
  }

  if (lines.length > 0) {
    fs.writeFileSync('.env', lines.join('\n'));
    console.log(`✅ Account IDs written to .env (region: ${options.region})`);
  } else {
    console.log(`⚠️  No account IDs found in SSM in region ${options.region}, .env not written.`);
  }
}

main();