/**
 * transformLinks - Transform links in the content
 * @param {string|ReadableStream} content The doc content
 * @returns {string|ReadableStream} The transformed content
 */
module.exports = function transformLinks(content) {
  content = content
    .replace(/\/packages\/gasket-plugin/g, '/docs/plugins/plugin')
    .replace(/\/packages\/gasket-preset/g, '/docs/presets/preset')
    .replace(/\/packages\/gasket-(?!plugin)(?!preset)/g, '/docs/modules/')
    .replace('/docs/generated-docs/', '/docs/')
    .replace('./LICENSE.md', '/docs/LICENSE.md')
    .replace('/packages/create-gasket-app/README.md', '/docs/create-gasket-app')
    .replace('./SECURITY.md', '/docs/SECURITY');
  return content;
};
