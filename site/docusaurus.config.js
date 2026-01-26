const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'Gasket',
  staticDirectories: ['static'],
  tagline: 'Framework Maker for JavaScript Applications',
  favicon: 'img/favicon.ico',
  url: 'https://gasket.dev',
  baseUrl: '/',
  trailingSlash: true,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/socialpreview.png',
      navbar: {
        title: '',
        logo: {
          alt: 'Gasket Framework Logo',
          src: 'img/logo-docs.svg',
          srcDark: 'img/logo-docs-dark.svg',
          href: '/',
          className: 'gasket-navbar-logo',
        },
        items: [
          {
            to: '/docs/',
            label: 'Docs',
            position: 'left',
          },
          {
            to: '/docs/#lifecycles',
            label: 'Lifecycles',
            position: 'left',
          },
          {
            to: '/docs/#actions',
            label: 'Actions',
            position: 'left',
          },
          {
            to: '/docs/modules',
            label: 'Modules',
            position: 'left',
          },
          {
            to: '/docs/plugins',
            label: 'Plugins',
            position: 'left',
          },
          {
            to: '/docs/templates',
            label: 'Templates',
            position: 'left',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'right'
          },
          {
            href: 'https://github.com/godaddy/gasket',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        copyright: `Copyright (c) 1999 - ${new Date().getFullYear()} GoDaddy Operating Company, LLC.`,
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Get Started',
                to: '/docs/quick-start',
              },
              {
                label: 'Overview',
                to: '/docs',
              },
              {
                label: 'Guides',
                to: '/docs#guides',
              },
            ],
          },
          {
            title: 'Channel',
            items: [
              {
                label: 'Blog',
                href: '/blog',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/gasketjs',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/gasket',
              },
            ],
          },
          {
            title: 'Contribute',
            items: [
              {
                label: 'Guidelines',
                to: '/docs/CONTRIBUTING',
              },
              {
                label: 'Github',
                href: 'https://github.com/godaddy/gasket/',
              },
            ],
          }
        ]
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
      algolia: {
        appId: 'OB26TYFNYK',
        apiKey: '6ac9413965486a885b0d332087335ead',
        indexName: 'gasket'
      }
    }),
};
