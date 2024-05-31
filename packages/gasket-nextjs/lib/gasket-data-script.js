import { createElement } from 'react';
import htmlescape from 'htmlescape';

/**
 * Renders a script tag with JSON gasketData
 *
 * @type {import('.').GasketDataScript} GasketDataScript
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
