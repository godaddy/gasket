// Local shapes of webpack's normalized entry, so any installed webpack's types fit.
/**
 * @typedef {object} EntryDescription
 * @property {string[]} [import] - modules loaded at startup
 */
/** @typedef {Record<string, EntryDescription>} EntryStaticNormalized */
/** @typedef {EntryStaticNormalized | (() => Promise<EntryStaticNormalized>)} EntryNormalized */

const loaderPath = require.resolve('./register-loader');

/**
 * Add the request to each matching entry. Webpack exports the last module of
 * an entry, so the request goes before it rather than after.
 * @param {EntryStaticNormalized} entry - normalized static entry
 * @param {string} request - module request to add
 * @param {(name: string) => boolean} filter - which entries to add it to
 * @returns {EntryStaticNormalized} updated entry
 */
function injectStatic(entry, request, filter) {
  return Object.fromEntries(Object.entries(entry).map(([name, desc]) => {
    if (!filter(name) || !desc.import) return [name, desc];
    const modules = desc.import;
    return [name, { ...desc, import: [...modules.slice(0, -1), request, ...modules.slice(-1)] }];
  }));
}

/**
 * @param {EntryNormalized} entry - normalized entry, static or dynamic
 * @param {string} request - module request to add
 * @param {(name: string) => boolean} filter - which entries to add it to
 * @returns {EntryNormalized} updated entry
 */
function injectEntry(entry, request, filter) {
  if (typeof entry === 'function') {
    return async () => injectStatic(await entry(), request, filter);
  }
  return injectStatic(entry, request, filter);
}

/**
 * Webpack plugin that adds the service worker registration script to entries.
 */
class RegisterPlugin {
  /**
   * @param {import('../index').ServiceWorkerConfig} config - configured url and scope
   * @param {(name: string) => boolean} [filter] - which entries to add it to
   */
  constructor({ url = '', scope = '' }, filter = () => true) {
    this.request = `${loaderPath}?${new URLSearchParams({ url, scope })}!`;
    this.filter = filter;
  }

  /**
   * @param {{ options: { entry: EntryNormalized } }} compiler - webpack compiler
   */
  apply(compiler) {
    compiler.options.entry = injectEntry(compiler.options.entry, this.request, this.filter);
  }
}

module.exports = { RegisterPlugin, injectEntry };
