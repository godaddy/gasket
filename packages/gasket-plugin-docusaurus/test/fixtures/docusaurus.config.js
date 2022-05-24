module.exports = {
  title: 'test-gasket',
  url: 'https://your-app-url.com',
  baseUrl: '/',
  organizationName: 'test-gasket',
  projectName: 'test-gasket',
  themeConfig: {
    navbar: {
      title: 'test-gasket'
    }
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/'
        },
        blog: false
      })
    ]
  ]
};
