module.exports = {
  title: '${name}',
  url: 'https://your-app-url.com',
  baseUrl: '/',
  organizationName: '${name}',
  projectName: '${name}',
  themeConfig: {
    navbar: {
      title: '${name}'
    }
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/',
          path: '${path}'
        },
        blog: false
      })
    ]
  ]
};
