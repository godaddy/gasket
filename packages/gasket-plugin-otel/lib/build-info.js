// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

const BUILD_INFO = {
  sha: process.env.BUILT_SHORT_SHA ?? '(unknown)',
  branch: process.env.BUILT_BRANCH ?? '(unknown)',
  built_at: process.env.BUILT_AT ?? '(unknown)',
  environment: process.env.NODE_ENV ?? 'unspecified',
  region: process.env.AWS_REGION ?? '(none)',
  process_start: new Date(Date.now()),
  service: packageJson.name,
  version: packageJson.version
};

module.exports = { BUILD_INFO };
