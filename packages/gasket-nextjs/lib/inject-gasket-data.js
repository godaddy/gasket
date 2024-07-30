/// <reference types="@gasket/plugin-data" />

import { Children, cloneElement, createElement } from 'react';
import { GasketDataScript } from './gasket-data-script.js';

function selectBody(children) {

  const bodyIdx = children.findIndex(t =>
    // @ts-ignore -- undefined type expected unless present
    t.type === 'body'
  );

  /** @type {import('react').ReactElement} body element */
  const body = children[bodyIdx];

  return [body, bodyIdx];
}

/**
 * Renders a script tag with JSON gasketData
 *
 * @type {import('.').injectGasketData}
 */
export function injectGasketData(html, gasketData, lookupIndex, insertIndex = -1) {
  const htmlChildren = Children.toArray(html.props.children);

  const [body, bodyIdx] = selectBody(htmlChildren);
  const bodyChildren = Children.toArray(body.props.children);
  // @ts-ignore -- we already determined this was an element with type 'body' check
  bodyChildren.splice(lookupIndex(bodyChildren, insertIndex), 0, createElement(GasketDataScript, { data: gasketData }));
  htmlChildren[bodyIdx] = cloneElement(body, {}, ...bodyChildren);

  return cloneElement(html, {}, ...htmlChildren);
}
