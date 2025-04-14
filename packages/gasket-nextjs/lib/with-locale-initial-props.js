/// <reference types="@gasket/plugin-intl" />

import { resolveGasketData } from '@gasket/data';

/**
 * Returns the request object from Next.js context (App or Page).
 * @param {import('next').NextPageContext | import('next/app').AppContext} ctx
 * @returns {import('http').IncomingMessage | undefined}
 */
export const getRequestFromContext = (ctx) =>
  // Functional guard for AppContext vs PageContext
  'ctx' in ctx ? ctx.ctx?.req : ctx.req;


/** @type {import('.').withLocaleInitialProps} */
export function withLocaleInitialProps(gasket) {
  return function wrapper(Component) {
    const originalGetInitialProps = Component.getInitialProps;
    Component.getInitialProps = async (ctx) => {
      // support app or page context
      const req = getRequestFromContext(ctx);
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
