/**
 * transformLinks - Transform links in the content
 * @param {string|ReadableStream} content The doc content
 * @returns {string|ReadableStream} The transformed content
 */
export default function transformLinks(content) {
  content = content
    .replace(/\/packages\/gasket-plugin/g, '/docs/plugins/plugin')
    .replace(/\/packages\/gasket-(?!plugin)/g, '/docs/modules/')
    .replace('/docs/generated-docs/', '/docs/')
    .replace('./LICENSE.md', '/docs/LICENSE.md')
    .replace('/packages/create-gasket-app/README.md', '/docs/create-gasket-app')
    .replace('./SECURITY.md', '/docs/SECURITY')
    .replace(/#([a-z]+[A-Z].*)/g, (_, match) => '#' + match.toLowerCase())
    .replace('./docs/', '/docs/');
  return content;
}
