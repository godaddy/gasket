const proxyquire = require('proxyquire').noCallThru();
const { spy, stub } = require('sinon');
const assume = require('assume');

describe('The plugin', () => {
  let plugin, startServers, gasketAPI;

  beforeEach(() => {
    startServers = spy();

    plugin = proxyquire('../..', {
      './start': startServers
    });

    gasketAPI = {
      config: {},
      exec: stub().resolves([{}])
    };
  });

  describe('start hook', () => {
    it('starts servers in non-development mode', async () => {
      gasketAPI.command = 'start';
      await plugin.hooks.start(gasketAPI);

      assume(startServers).has.been.calledWith(gasketAPI, { dev: false });
    });

    it('starts servers in development mode if local cmd', async () => {
      gasketAPI.command = 'local';
      await plugin.hooks.start(gasketAPI);

      assume(startServers).has.been.calledWith(gasketAPI, { dev: true });
    });
  });

  describe('build hook', () => {
    it('creates a build', async () => {
      gasketAPI.command = 'build';
      await plugin.hooks.build(gasketAPI);

      assume(gasketAPI.exec).has.been.calledWith('nextBuild');
    });

    it('does not create a build if local cmd', async () => {
      gasketAPI.command = 'local';
      await plugin.hooks.build(gasketAPI);

      assume(gasketAPI.exec).not.has.been.calledWith('nextBuild');
    });
  });

  describe('workbox hook', () => {
    it('returns workbox config partial', async () => {
      const results = await plugin.hooks.workbox(gasketAPI);

      assume(results).to.be.an('object');
    });

    it('config partial contains expected properties', async () => {
      const results = await plugin.hooks.workbox(gasketAPI);

      assume(results).to.have.property('globDirectory', '.');
      assume(results).to.have.property('globPatterns');
      assume(results).to.have.property('modifyURLPrefix');
    });

    it('config modifies urls from to _next', async () => {
      const results = await plugin.hooks.workbox(gasketAPI);

      assume(results.modifyURLPrefix).to.have.property('.next/', '_next/');
    });

    it('config modifies urls to use assetPrefix with https', async () => {
      const assetPrefix = 'https://some-cdn.com/';
      gasketAPI.config.next = { assetPrefix };
      const results = await plugin.hooks.workbox(gasketAPI);
      assume(results.modifyURLPrefix).to.have.property('.next/', assetPrefix + '_next/');
    });

    it('config modifies urls to use assetPrefix with http', async () => {
      const assetPrefix = 'http://some-cdn.com/';
      gasketAPI.config.next = { assetPrefix };
      const results = await plugin.hooks.workbox(gasketAPI);
      assume(results.modifyURLPrefix).to.have.property('.next/', assetPrefix + '_next/');
    });

    it('config modifies urls to use assetPrefix with https but no trailing slash', async () => {
      const assetPrefix = 'https://some-cdn.com';
      gasketAPI.config.next = { assetPrefix };
      const results = await plugin.hooks.workbox(gasketAPI);
      assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}/_next/`);
    });

    it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
      const assetPrefix = '/some/asset/prefix/';
      gasketAPI.config.next = { assetPrefix };
      const results = await plugin.hooks.workbox(gasketAPI);
      assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}_next/`);
    });

    it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
      const assetPrefix = '/some/asset/prefix';
      gasketAPI.config.next = { assetPrefix };
      const results = await plugin.hooks.workbox(gasketAPI);
      assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}/_next/`);
    });
  });
});
