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
 * @param {Array} bodyChildren - An array of React elements that are children of the body element.
 * @param {number} [index] - An optional index at which to insert the script. If not provided, determine the best index.
 * @returns {number} - The index at which the GasketData script should be inserted.
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
 * @type {import('.').withGasketData}
 */
export function withGasketData(
  gasket,
  options = {}
) {
  const { index = -1 } = options;

  return Document => {

    /**
     * Asynchronously fetches initial properties for the document.
     * If a request is present in the context, it fetches public Gasket data.
     * Otherwise, it returns an empty object.
     * @param {object} ctx - The context object.
     * @returns {Promise<object>} A promise that resolves with the initial properties for the document.
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

        render() {
          const html = super.render();
          const { gasketData } = this.props;

          return injectGasketData(html, gasketData, lookupIndex, index);
        }
      };
    }

    /**
     * A function that wraps the Document component and injects GasketData into it.
     * @param {object} props - The properties passed to the Document component.
     * @returns {import('react').ReactElement} - The Document component with GasketData injected.
     */
    function WrappedDocument(props) {
      // eslint-disable-next-line new-cap
      const html = Document(props);
      const { gasketData } = props;

      return injectGasketData(html, gasketData, lookupIndex, index);
    }

    WrappedDocument.getInitialProps = getInitialProps;

    return WrappedDocument;
  };
}
