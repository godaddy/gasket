import { vi } from 'vitest';

let __warnings = [];
let __swString = `
/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */
 
importScripts(
  "_workbox/workbox-v4.1.0/workbox-sw.js"
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
`;

export const __setWarnings = warnings => {
  __warnings = warnings;
};

export const copyWorkboxLibraries = vi.fn();

export const generateSWString = vi.fn(() => Promise.resolve({
  warnings: __warnings,
  swString: __swString
}));
