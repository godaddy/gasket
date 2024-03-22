/* eslint-disable spaced-comment */
/// <reference types="@gasket/engine" />

const path = require('path');
const fs = require('fs').promises;

// Because getNextRoute may be called multiple times during a request, cache
const nextRouteForRequest = new WeakMap();

/**
 * Gets the NextJS route matching the request
 * @param {import("@gasket/engine").Gasket}  gasket  The gasket engine
 * @param {import("http").IncomingMessage} req     The HTTP request
 * @returns {Promise<object | null>} A Next.JS route object or null
 */
async function getNextRoute(gasket, req) {
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
}

let routesPromise, routesLoadError, cachedRoutes;
/**
 *
 * @param gasket
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
      .then(content => {
        const routes = JSON.parse(content.toString());
        for (const route of iterateRoutes(routes)) {
          route.regex = new RegExp(route.regex);
          route.namedRegex = new RegExp(route.namedRegex);
        }

        cachedRoutes = routes;
        return routes;
      })
      .catch(err => {
        gasket.logger.warning('Failed to parse next.js routes', err);
        routesLoadError = err;
      });
  }

  return routesPromise;
}

/**
 *
 * @param routes
 */
function *iterateRoutes(routes) {
  yield* routes.staticRoutes;
  yield* routes.dynamicRoutes;
}

module.exports = getNextRoute;
