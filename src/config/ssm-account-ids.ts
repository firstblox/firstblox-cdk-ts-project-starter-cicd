export const accountParams = [
  { env: 'ACCOUNT_ID_PIPELINE', ssm: '/accountId/pipeline' },
  { env: 'ACCOUNT_ID_DEV', ssm: '/accountId/dev' },
  { env: 'ACCOUNT_ID_QA', ssm: '/accountId/qa' },
  { env: 'ACCOUNT_ID_STAGING', ssm: '/accountId/staging' },
  { env: 'ACCOUNT_ID_PROD', ssm: '/accountId/prod' },
];

export interface AccountId {
  pipeline: string;
  dev: string;
  qa: string;
  staging: string;
  prod: string;
}