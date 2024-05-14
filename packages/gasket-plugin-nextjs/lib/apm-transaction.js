/// <reference types="@gasket/plugin-elastic-apm" />

/** @type {import('@gasket/engine').HookHandler<'apmTransaction'>} */
module.exports = async function apmTransaction(gasket, transaction, { req }) {
  const route = await req.getNextRoute();

  if (!route) {
    return;
  }

  transaction.name = route.page;

  const match = route.namedRegex.exec(req.url.replace(/\?.*$/, ''));
  const groups = match && match.groups;

  if (!groups) {
    return;
  }

  transaction.addLabels(
    Object.fromEntries(
      Object.entries(groups).map(([key, value]) => {
        let decodedValue = value;
        try {
          decodedValue = decodeURIComponent(value);
        } catch (e) {
          // ignore
        }
        return [key, decodedValue];
      })
    )
  );
};
