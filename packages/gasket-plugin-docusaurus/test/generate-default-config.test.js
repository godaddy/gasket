const assume = require('assume');
const generateDefaultConfig = require('../lib/generate-default-config');

describe('docsView', () => {

  it('creates a config with correct name', () => {
    const configData = generateDefaultConfig('test-gasket');
    const configString = configData.replace(/\n\s*/g, '');
    const testConfigString = `
    module.exports = {
      title: 'test-gasket',
      url: 'https://your-app-url.com',
      baseUrl: '/',
      organizationName: 'test-gasket',
      projectName: 'test-gasket',
      themeConfig: {
        navbar: {
          title: 'test-gasket',
        }
      },
      presets: [
        [
          'classic',
          ({
            docs: {
              routeBasePath: '/',
            },
            blog: false,
          }),
        ],
      ],
    };`.replace(/\n\s*/g, '');

    assume(configString).equals(testConfigString);
  });
});
