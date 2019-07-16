const path = require('path');
const { describe, it } = require('mocha');
const assume = require('assume');
const plugin = require('../../index');
const sinon = require('sinon');

assume.use(require('assume-sinon'));

let mockContext;

function assumeCreatedWith(assertFn) {
  return async function assumeCreated() {
    await plugin.hooks.create({}, mockContext);
    assertFn(mockContext);
  };
}

describe('core-plugin', function () {

  beforeEach(() => {
    mockContext = {
      pkg: { add: sinon.spy() },
      files: { add: sinon.spy() }
    };
  });

  it('adds the appropriate globs', assumeCreatedWith(({ files }) => {
    const root = path.join(__dirname, '..', '..');
    assume(files.add).calledWith(
      `${root}/generator/.*`,
      `${root}/generator/*`,
      `${root}/generator/**/*`
    );
  }));

  it('adds appropriate dependencies', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('dependencies', {
      '@gasket/assets': '^1.0.0',
      'express': '^4.16.3',
      'next': '^8.0.3',
      'prop-types': '^15.6.2',
      'react': '^16.4.1',
      'react-dom': '^16.4.1',
      'react-transition-group': '^2.4.0'
    });
  }));

  it('adds the appropriate license', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('license', 'UNLICENSED');
  }));

  it('adds appropriate devDependencies', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('devDependencies', {
      'babel-core': '^7.0.0-bridge.0'
    });
  }));

  it('adds appropriate scripts', assumeCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('scripts', {
      local: 'gasket local',
      build: 'gasket build',
      start: 'gasket start'
    });
  }));
});
