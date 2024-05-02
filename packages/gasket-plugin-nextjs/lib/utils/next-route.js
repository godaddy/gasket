/// <reference types="@gasket/engine" />

const path = require('path');

const fs = require('fs').promises;

// Because getNextRoute may be called multiple times during a request, cache
const nextRouteForRequest = new WeakMap();

let routesPromise;
let routesLoadError;
let cachedRoutes;

/**
 * Loads the NextJS routes manifest
 * @param {import('@gasket/engine').Gasket} gasket - Gasket API
 * @returns {Promise<*>} routes
 */
async function loadRoutes(gasket) {
  if (routesLoadError) {
    return null;
  }

  if (cachedRoutes) {
    return cachedRoutes;
  }

  if (!routesPromise) {
    routesPromise = fs
      .readFile(path.join(gasket.config.root, '.next', 'routes-manifest.json'))
      .then((content) => {
        const routes = JSON.parse(content.toString());

        for (const route of iterateRoutes(routes)) {
          route.regex = new RegExp(route.regex);
          route.namedRegex = new RegExp(route.namedRegex);
        }

        cachedRoutes = routes;
        return routes;
      })
      .catch((err) => {
        gasket.logger.warning('Failed to parse next.js routes', err);
        routesLoadError = err;
      });
  }

  return routesPromise;
}

/**
 * Iterates over the static and dynamic routes
 * @param {any} routes - NextJS routes
 * @yields {IterableIterator<*>}
 */
function *iterateRoutes(routes) {
  yield* routes.staticRoutes;
  yield* routes.dynamicRoutes;
}

/**
 * Gets the NextJS route matching the request
 * @type {import('@gasket/plugin-nextjs').getNextRoute}
 */
module.exports = async function getNextRoute(gasket, req) {
  if (nextRouteForRequest.has(req)) {
    return nextRouteForRequest.get(req);
  }

  let result = null;
  const routes = await loadRoutes(gasket);

  if (routes) {
    for (const route of iterateRoutes(routes)) {
      if (route.regex.test(req.path)) {
        result = route;
        break;
      }
    }
  }

  nextRouteForRequest.set(req, result);
  return result;
};
