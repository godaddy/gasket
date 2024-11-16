import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';

import { defaultPlugins } from '../../../lib/config/default-plugins.js';
import { jest } from '@jest/globals';

jest.mock('@gasket/plugin-git', () => jest.fn());
jest.mock('@gasket/plugin-logger', () => jest.fn());
jest.mock('@gasket/plugin-metadata', () => jest.fn());
jest.mock('@gasket/plugin-command', () => jest.fn());
jest.mock('@gasket/plugin-docs', () => jest.fn());
jest.mock('@gasket/plugin-docusaurus', () => jest.fn());
jest.mock('@gasket/plugin-dynamic-plugins', () => jest.fn());

describe('defaultPlugins', () => {
  it('should include the correct plugins', () => {
    expect(defaultPlugins).toEqual([
      pluginLogger,
      pluginGit,
      pluginMetadata,
      pluginCommand,
      pluginDocs,
      pluginDocusaurus,
      pluginDynamicPlugins
    ]);
  });
});
