/// <reference types="@gasket/plugin-data" />

import { Children, cloneElement, createElement } from 'react';
import { Main, NextScript } from 'next/document.js';  // Conflicts with package.json exports - extensions required
import { GasketDataScript } from '../gasket-data-script.js';

const reClass = /^class\s/;

/** @type {import('./internal.js').isDocumentClass} */
function isDocumentClass(maybeClass) {
  return typeof maybeClass === 'function' && reClass.test(Function.prototype.toString.call(maybeClass));
}

/** @type {import('./internal.js').selectBody} */
function selectBody(children) {

  const bodyIdx = children.findIndex(t =>
    // @ts-ignore -- undefined type expected unless present
    t.type === 'body'
  );

  /** @type {import('react').ReactElement} body element */
  // @ts-ignore -- we already determined this was an element with type 'body' check
  const body = children[bodyIdx];

  return [body, bodyIdx];
}

function injectGasketData(html, gasketData, insertIndex = -1) {
  const htmlChildren = Children.toArray(html.props.children);

  const [body, bodyIdx] = selectBody(htmlChildren);
  const bodyChildren = Children.toArray(body.props.children);

  bodyChildren.splice(lookupIndex(bodyChildren, insertIndex), 0, createElement(GasketDataScript, { data: gasketData }));
  htmlChildren[bodyIdx] = cloneElement(body, {}, ...bodyChildren);

  return cloneElement(html, {}, ...htmlChildren);
}

/**
 * To avoid polluting <head/>, we want to render our JSON in the <body/>
 * but before our other scripts so that it is available to query.
 * In a basic Next.js app, this is between the Main and NextScript tags.*
 *
 * @param {Array} bodyChildren - Children of body element
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
 *
 * @type {import('.').withGasketData}
 */
export function withGasketData(
  gasket,
  options = {}
) {
  const { index = -1 } = options;

  return Document => {

    async function getInitialProps(ctx) {
      const gasketData = ctx.req ? await gasket.actions.getPublicGasketData?.(ctx.req) ?? {} : {};

      return {
        ...(await Document.getInitialProps(ctx)),
        gasketData
      };
    }

    // if class-based Document
    if(isDocumentClass(Document)) {
      return class GasketDocument extends Document {
        static async getInitialProps(ctx) {
          return getInitialProps(ctx);
        }

        render() {
          const html = super.render();
          const { gasketData } = this.props;

          return injectGasketData(html, gasketData, index);
        }
      };
    }

    function WrappedDocument(props) {
      const html = Document(props);
      const { gasketData } = props;

      return injectGasketData(html, gasketData, index);
    }

    WrappedDocument.getInitialProps = getInitialProps;

    return WrappedDocument;
  };
}
