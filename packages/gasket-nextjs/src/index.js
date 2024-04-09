import React from 'react';
import PropTypes from 'prop-types';
import { Main, NextScript } from 'next/document';
import htmlescape from 'htmlescape';

/**
 * Renders a script tag with JSON gasketData
 * @type {import('./index').GasketDataScript}
 */
export const GasketDataScript = function ({ data }) {
  return (
    <script
      id='GasketData'
      type='application/json'
      dangerouslySetInnerHTML={{
        __html: htmlescape(data)
      }}
    />
  );
};

GasketDataScript.propTypes = {
  data: PropTypes.object
};

/**
 * Make a wrapper to extend the Next.js Document, injecting a script with the
 * `gasketData` from the response object.
 * @type {import('./index').withGasketData}
 */
export function withGasketData(options = {}) {
  const { index = -1 } = options;

  /**
   * To avoid polluting <head/>, we want to render our JSON in the <body/> but
   * before our other scripts so that it is available to query. In a basic
   * Next.js app, this is between the Main and NextScript tags.*
   * @param {JSX.Element[]} bodyChildren - Children of body element
   * @returns {number} index
   * @private
   */
  function lookupIndex(bodyChildren) {
    const lookups = [
      // Try to find <Main/> and insert after
      () => bodyChildren.findIndex((o) => o.type === Main) + 1 || -1,
      // Otherwise, try to find the first <script/> or <NextScript/>
      () =>
        bodyChildren.findIndex(
          (o) => o.type === 'script' || o.type === NextScript
        ),
      // Otherwise, assume <Main/> is child of the first element
      () => 1
    ];
    return lookups.reduce((acc, cur) => (acc !== -1 ? acc : cur()), index);
  }

  return (DocumentClass) => {
    return class GasketDocument extends DocumentClass {
      /**  @type {import('./index').GasketDocumentGetInitialProps} */
      static async getInitialProps(ctx) {
        const { locals: { gasketData = {} } = {} } = ctx.res || {};

        const initialProps = await DocumentClass.getInitialProps(ctx);

        return {
          ...initialProps,
          gasketData
        };
      }

      render() {
        const html = super.render();
        const { gasketData } = this.props;

        const htmlChildren = React.Children.toArray(html.props.children);
        // @ts-ignore
        const bodyIdx = htmlChildren.findIndex((t) => t.type === 'body');
        const body = htmlChildren[bodyIdx];
        // @ts-ignore
        const bodyChildren = React.Children.toArray(body.props.children);
        bodyChildren.splice(
          // @ts-ignore
          lookupIndex(bodyChildren),
          0,
          <GasketDataScript data={ gasketData } />
        );
        // @ts-ignore
        htmlChildren[bodyIdx] = React.cloneElement(body, {}, ...bodyChildren);

        return React.cloneElement(html, {}, ...htmlChildren);
      }
    };
  };
}

export * from './use-gasket-data';
export * from './with-gasket-data-provider';
