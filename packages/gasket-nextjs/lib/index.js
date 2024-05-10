import { Children, cloneElement, createElement } from 'react';
import PropTypes from 'prop-types';
import { Main, NextScript } from 'next/document';
import htmlescape from 'htmlescape';

const reClass = /^class\s/;
function isClass(func) {
  return typeof func === 'function' && reClass.test(Function.prototype.toString.call(func));
}

function injectGasketData(html, gasketData, insertIndex = -1) {
  const htmlChildren = Children.toArray(html.props.children);
  const bodyIdx = htmlChildren.findIndex(t => t.type === 'body');
  const body = htmlChildren[bodyIdx];
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
 * Renders a script tag with JSON gasketData
 *
 * @param {object} props - Props
 * @param {GasketData} props.data - Gasket data from response
 * @returns {JSX.Element} script
 */
export function GasketDataScript(props) {
  const { data } = props;
  return createElement('script', {
    id: "GasketData",
    type: "application/json",
    dangerouslySetInnerHTML: {
      __html: htmlescape(data)
    }
  });
}

GasketDataScript.propTypes = {
  data: PropTypes.object
};

/**
 * Make a wrapper to extend the Next.js Document, injecting a script with the
 * `gasketData` from the response object.
 *
 * @param {object} [options] - Configuration for wrapper
 * @param {number} [options.index] - Force script injection at particular index
 * @returns {function(Document)} wrapper
 */
export function withGasketData(options = {}) {
  const { index = -1 } = options;


  /**
   * Extend the Document
   *
   * @param {Document} Document - Next Document class to wrap
   * @returns {Document} extended Document
   */
  return Document => {

    async function getInitialProps(ctx) {
      const {
        locals: {
          gasketData = {}
        } = {}
      } = ctx.res || {};

      return {
        ...(await Document.getInitialProps(ctx)),
        gasketData
      };
    }

    // if class-based Document
    if(isClass(Document)) {
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

      return injectGasketData(html, props.gasketData, index);
    }

    WrappedDocument.getInitialProps = getInitialProps;

    return WrappedDocument;
  };
}

export * from './use-gasket-data';
export * from './with-gasket-data-provider';
