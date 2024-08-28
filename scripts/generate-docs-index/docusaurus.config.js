module.exports = {
  title: 'generate-docs-index',
  url: 'https://your-app-url.com',
  baseUrl: '/',
  organizationName: 'generate-docs-index',
  projectName: 'generate-docs-index',
  themeConfig: {
    navbar: {
      title: 'generate-docs-index'
    }
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/',
          path: 'docs'
        },
        blog: false
      })
    ]
  ],
  plugins: [
    () => ({
      name: 'resolve-webpack-hotreload-error',
      // eslint-disable-next-line no-unused-vars
      configureWebpack(config, isServer, utils) {
        return {
          devServer: {
            hot: false
          }
        };
      }
    })
  ]
};
