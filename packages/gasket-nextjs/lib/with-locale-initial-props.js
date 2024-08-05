/// <reference types="@gasket/plugin-intl" />

import { resolveGasketData } from '@gasket/data';

export function withLocaleInitialProps(gasket) {
  return function wrapper(Component) {
    const originalGetInitialProps = Component.getInitialProps;
    Component.getInitialProps = async (ctx) => {
      // support app or page context
      const req = ctx.ctx?.req ?? ctx.req;
      const gasketData = await resolveGasketData(gasket, req);
      const { locale } = gasketData.intl;

      return {
        ...(originalGetInitialProps ? await originalGetInitialProps(ctx) : {}),
        locale
      }
    };

    return Component;
  };
}
