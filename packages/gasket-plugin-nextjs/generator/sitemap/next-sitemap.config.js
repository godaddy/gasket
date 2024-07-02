// next-sitemap docs: https://github.com/iamvishnusankar/next-sitemap
/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.SITE_URL || 'https://example.com',
  generateRobotsTxt: true // (optional)
  // ...other options
};
