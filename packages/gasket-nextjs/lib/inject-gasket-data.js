/// <reference types="@gasket/plugin-data" />

import { Children, cloneElement, createElement } from 'react';
import { GasketDataScript } from './gasket-data-script.js';

/**
 * Type guard to check if a ReactNode is a ReactElement.
 * @param {React.ReactNode} node
 * @returns {node is React.ReactElement}
 */
function isReactElement(node) {
  return typeof node === 'object' && node !== null && 'type' in node;
}

function selectBody(children) {
  const bodyIdx = children.findIndex(t =>
    t.type === 'body'
  );

  /** @type {import('react').ReactElement} body element */
  const body = children[bodyIdx];

  return [body, bodyIdx];
}

/**
 * Renders a script tag with JSON gasketData
 * @type {import('.').injectGasketData}
 */
export function injectGasketData(html, gasketData, lookupIndex, insertIndex = -1) {
  const htmlChildren = Children.toArray(html.props.children);
  const [body, bodyIdx] = selectBody(htmlChildren);
  const bodyChildren = Children.toArray(body.props.children).filter(isReactElement);

  bodyChildren.splice(lookupIndex(bodyChildren, insertIndex), 0, createElement(GasketDataScript, { data: gasketData }));
  htmlChildren[bodyIdx] = cloneElement(body, {}, ...bodyChildren);

  return cloneElement(html, {}, ...htmlChildren);
}
