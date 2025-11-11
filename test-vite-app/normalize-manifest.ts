/**
 * Normalize Presentation Central v3 response to v2 format
 * 
 * This is adapted from @godaddy/gasket-next/server/fixup-manifest.js
 * to handle both PC API versions transparently.
 */

/**
 * Helper to ensure all hint values are strings
 */
function ensureStringValues(hints: any): Record<string, any> {
  if (!hints || typeof hints !== 'object') return hints;
  
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(hints)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = ensureStringValues(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Build a single HTML element from properties
 * Adapted from gasket-next/server/utils.js
 */
function buildElem(elemProps: any, elemType: string): string {
  // Handle elements coming in as strings
  if (typeof elemProps === 'string') {
    // Wrap raw CSS in style tags if needed
    if (elemType === 'link' &&
      !elemProps.includes('<style>') &&
      !elemProps.includes('<link')) {
      return `<style>${elemProps}</style>`;
    }
    return elemProps;
  }

  // Build element from object properties
  const attr = Object.keys(elemProps)
    .map((prop) => {
      if (elemProps[prop] !== false) {
        if (elemProps[prop] === true) {
          return prop;
        }
        return `${prop}="${elemProps[prop]}"`;
      }
      return null;
    })
    .filter(item => item)
    .join(' ');

  return elemType === 'script' ?
    `<${elemType} ${attr}></script>` :
    `<${elemType} ${attr} />`;
}

/**
 * Helper to build HTML elements from objects/arrays
 * Adapted from gasket-next/server/utils.js
 */
function elemBuilder(elems: any, elemType: string = 'string'): string {
  // Check if the elements are already built
  if (typeof elems === 'string') return elems;
  
  try {
    // Handle arrays
    if (Array.isArray(elems)) {
      return elems
        .map((elem) => buildElem(elem, elemType))
        .join('');
    }
    
    // Handle objects
    return Object.keys(elems)
      .map((property) => {
        if (typeof elems[property] === 'string') {
          return buildElem(elems[property], elemType);
        }
        if (Array.isArray(elems[property])) {
          return elems[property]
            .map((elem: any) => buildElem(elem, elemType))
            .join('');
        }
        return '';
      })
      .join('');
  } catch {
    return '';
  }
}

/**
 * Normalize PC v3 response to v2 format
 * 
 * V3 uses a nested structure with arrays of objects for assets.
 * V2 uses a flat structure with HTML strings.
 * 
 * This function transforms v3 → v2 so the rest of the app
 * can work with a consistent format.
 */
export function normalizeManifest(data: any): any {
  const {
    browserDeprecation = '',
    hints = {},
    css = '',
    favicons = '',
    config = '',
    components = '',
    hydrate = '',
    deferjs = '',
    js = ''
  } = data;

  const faviconLink =
    (typeof favicons !== 'string' && favicons.links) || favicons;

  // Scripts to load in lower part of body
  const globals =
    (typeof config !== 'string' &&
      [config.setup, config.hcs, config.hivemind, config.tealium]
        .filter(Boolean)
        .join('')) ||
    config;

  const results: any = {
    hints: ensureStringValues(hints),
    assets: {
      css: [
        browserDeprecation,
        elemBuilder(css, 'link'),
        elemBuilder(faviconLink, 'link'),
        elemBuilder(favicons.meta, 'meta')
      ].join(''),
      js: elemBuilder(js, 'script')
    },
    header: components.header || components,
    footer: components.footer || components,
    loaders: hydrate,
    globals
  };

  if (deferjs) {
    results.assets.deferjs = elemBuilder(deferjs, 'script');
  }

  return results;
}

/**
 * Check if PC response is v3 based on the meta URL
 */
export function isV3Response(pcContent: any): boolean {
  return pcContent?.meta?.url?.includes('/v3/') || false;
}

