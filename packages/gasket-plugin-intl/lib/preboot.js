/// <reference types="@gasket/plugin-https" />

/**
 * Preboot lifecycle hook - waits for all locale files to finish loading
 * before the server opens its port.
 *
 * InternalIntlManager.init() kicks off locale preloading asynchronously
 * (fire-and-forget) when the manager is first imported. Without this hook,
 * requests that arrive before preloading completes receive an empty messages
 * object and render i18n keys instead of translated strings.
 *
 * LocaleHandler.load() returns the already in-flight promise from
 * promisesRegister (debounced), so this does not trigger extra I/O.
 * @type {import('@gasket/core').HookHandler<'preboot'>}
 */
export default async function preboot(gasket) {
  if (gasket.config.intl?.experimentalImportAttributes) {
    const intlMgr = await gasket.actions.getIntlManager();
    await Promise.all(
      intlMgr.locales.map(locale => intlMgr.handleLocale(locale).load())
    );
  }
}
