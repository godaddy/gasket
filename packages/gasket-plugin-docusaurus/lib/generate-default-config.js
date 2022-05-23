/**
 * Generate base docusaurus config
 *
 * @param {string} name - Name of the Gasket app
 * @returns {string} - docusaurus config file
 */
module.exports = function generateDefaultConfig(name) {
  return `
  module.exports = {
    title: '${name}',
    url: 'https://your-app-url.com',
    baseUrl: '/',
    organizationName: '${name}',
    projectName: '${name}',
    themeConfig: {
      navbar: {
        title: '${name}',
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
  };`;
};
