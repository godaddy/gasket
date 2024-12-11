import { request } from '../request';
import { injectGasketData } from '../inject-gasket-data.js'
import NextScript from 'next/script';

/**
 * To avoid polluting <head/>, we want to render our JSON in the <body/>
 * but before our other scripts so that it is available to query.
 *
 * @param {Array} bodyChildren - Children of body element
 * @returns {number} index
 * @private
 */
function lookupIndex(bodyChildren, index = -1) {
  const lookups = [
    // Try to find the first <script/> or <NextScript/>
    () => bodyChildren.findIndex(o => o.type === 'script' || o.type === NextScript),
    // Otherwise, use index 1
    () => 1
  ];
  return lookups.reduce((acc, cur) => acc !== -1 ? acc : cur(), index);
}

/**
 * Make a wrapper to around the Root Layout, injecting a script with the
 * `gasketData`.
 *
 * @type {import('.').withGasketData}
 */
export function withGasketData(gasket, options = { index: -1 }) {
  const { index } = options;
  return layout => async props => {
    const req = await request();
    const gasketData = req ? await gasket.actions.getPublicGasketData?.(req) ?? {} : {};
    const html = await layout({ ...props });
    return injectGasketData(html, gasketData, lookupIndex, index);
  }
}
