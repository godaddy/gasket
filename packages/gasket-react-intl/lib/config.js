"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.manifest = exports.isBrowser = exports.clientData = exports.basePath = void 0;
var _data = _interopRequireDefault(require("@gasket/data"));
var _ref, _gasketData;
/* eslint-disable no-process-env */
/**
 * @type {import('@gasket/helper-intl').LocaleManifest}
 */
var manifest = exports.manifest = process.env.GASKET_INTL_MANIFEST_FILE ? require(process.env.GASKET_INTL_MANIFEST_FILE) : {};
var isBrowser = exports.isBrowser = typeof window !== 'undefined';

/** @type {import('.').IntlGasketData} */
// @ts-ignore -- default to empty object
var clientData = exports.clientData = (_ref = isBrowser && ((_gasketData = (0, _data["default"])()) === null || _gasketData === void 0 ? void 0 : _gasketData.intl)) !== null && _ref !== void 0 ? _ref : {};
var _clientData$basePath = clientData.basePath,
  basePath = exports.basePath = _clientData$basePath === void 0 ? manifest.basePath : _clientData$basePath;