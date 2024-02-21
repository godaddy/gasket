const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'Gasket',
  staticDirectories: ['public', 'static'],
  tagline: 'Gasket is cool',
  favicon: 'img/favicon.ico',
  url: 'https://mmason2-godaddy.github.io',
  baseUrl: '/gasket-os/',
  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mmason2-godaddy', // Usually your GitHub org/user name.
  projectName: 'gasket-os', // Usually your repo name.
  deploymentBranch: 'PFX-238',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
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
          srcDark: 'img/logo-docs.svg',
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
            to: '/docs/presets',
            label: 'Presets',
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
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      }
    }),
};
