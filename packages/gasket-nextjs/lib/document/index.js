/* eslint-disable new-cap */
/// <reference types="@gasket/plugin-data" />

import { Main, NextScript } from 'next/document.js';  // Conflicts with package.json exports - extensions required
import { injectGasketData } from '../inject-gasket-data.js';

const reClass = /^class\s/;

/** @type {import('./internal.js').isDocumentClass} */
function isDocumentClass(maybeClass) {
  return typeof maybeClass === 'function' && reClass.test(Function.prototype.toString.call(maybeClass));
}

/**
 * To avoid polluting <head/>, we want to render our JSON in the <body/>
 * but before our other scripts so that it is available to query.
 * In a basic Next.js app, this is between the Main and NextScript tags.*
 * @param {Array} bodyChildren - Children of body element
 * @param index
 * @returns {number} index
 * @private
 */
function lookupIndex(bodyChildren, index = -1) {
  const lookups = [
    // Try to find <Main/> and insert after
    () => bodyChildren.findIndex(o => o.type === Main) + 1 || -1,
    // Otherwise, try to find the first <script/> or <NextScript/>
    () => bodyChildren.findIndex(o => o.type === 'script' || o.type === NextScript),
    // Otherwise, assume <Main/> is child of the first element
    () => 1
  ];
  return lookups.reduce((acc, cur) => acc !== -1 ? acc : cur(), index);
}

/**
 * Make a wrapper to extend the Next.js Document, injecting a script with the
 * `gasketData` from the response object.
 * @type {import('./index.d.ts').withGasketData}
 */
export function withGasketData(
  gasket,
  options = {}
) {
  const { index = -1 } = options;

  return Document => {

    /**
     *
     * @param ctx
     */
    async function getInitialProps(ctx) {
      const gasketData = ctx.req ? await gasket.actions.getPublicGasketData?.(ctx.req) ?? {} : {};

      return {
        ...(await Document.getInitialProps(ctx)),
        gasketData
      };
    }

    // if class-based Document
    if (isDocumentClass(Document)) {
      return class GasketDocument extends Document {
        static async getInitialProps(ctx) {
          return getInitialProps(ctx);
        }

        /** @type {import('next/document').DocumentInitialProps & { gasketData: import('@gasket/data').GasketData }} */
        props;

        render() {
          const html = super.render();
          const { gasketData } = this.props;

          return injectGasketData(html, gasketData, lookupIndex, index);
        }
      };
    }

    /**
     *
     * @param props
     */
    function WrappedDocument(props) {
      const html = Document(props);
      const { gasketData } = props;

      return injectGasketData(html, gasketData, lookupIndex, index);
    }

    WrappedDocument.getInitialProps = getInitialProps;

    return WrappedDocument;
  };
}
