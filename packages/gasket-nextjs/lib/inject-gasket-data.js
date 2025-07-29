/// <reference types="@gasket/plugin-data" />

import { Children, cloneElement, createElement } from 'react';
import { GasketDataScript } from './gasket-data-script.js';

/**
 * Type guard to check if a ReactNode is a ReactElement.
 * @param {import('react').ReactNode} node - A React node to check.
 * @returns {node is import('react').ReactElement} results
 */
function isReactElement(node) {
  return typeof node === 'object' && node != null && 'type' in node;
}

const selectBody = (children) => {
  const bodyIdx = children.findIndex(t =>
    t.type === 'body'
  );

  /** @type {import('react').ReactElement} body element */
  const body = children[bodyIdx];

  return [body, bodyIdx];
};

/**
 * Renders a script tag with JSON gasketData
 * @type {import('./index.d.ts').injectGasketData}
 */
export function injectGasketData(html, gasketData, lookupIndex, insertIndex = -1) {
  // html is declared as a ReactElement in types, but needs an explicit cast here
  // because TypeScript infers it as `unknown` inside the JS runtime without a param type
  /** @type {import('react').ReactElement} */
  const htmlElement = /** @type {import('react').ReactElement} */ (html);

  const htmlChildren = Children.toArray(htmlElement.props.children);
  const [body, bodyIdx] = selectBody(htmlChildren);
  const bodyChildren = Children.toArray(body.props.children).filter(isReactElement);

  bodyChildren.splice(lookupIndex(bodyChildren, insertIndex), 0, createElement(GasketDataScript, { data: gasketData }));
  htmlChildren[bodyIdx] = cloneElement(body, {}, ...bodyChildren);

  return cloneElement(htmlElement, {}, ...htmlChildren);
}
