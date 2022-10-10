const { stub } = require('sinon');
const assume = require('assume');
const metadata = require('../lib/metadata');

describe('metadata', function () {
  let mockGasket;
  beforeEach(function () {
    mockGasket = {
      metadata: {
        plugins: []
      }
    }
  });

  it('outputs expected categories', function () {
    const meta = metadata(mockGasket, {});
    const expected = [
      'guides',
      'lifecycles',
      'structures',
      'configurations'
    ];

    const keys = Object.keys(meta);
    assume(keys).eqls(expected);
    assume(keys).is.length(expected.length);
  });

  it('includes express lifecycles for express plugin', function () {
    mockGasket.metadata.plugins.push({
      name: '@gasket/plugin-express'
    })
    const meta = metadata(mockGasket, {});
    const expressLifecycles = meta.lifecycles.filter(data => data.description.includes('Express'))
    assume(expressLifecycles).length(2)
    assume(expressLifecycles[0]).property('name', 'next')
    assume(expressLifecycles[1]).property('name', 'nextExpress')

    const fastifyLifecycles = meta.lifecycles.filter(data => data.description.includes('Fastify'))
    assume(fastifyLifecycles).length(0)
  });

  it('includes fastify lifecycles for fastify plugin', function () {
    mockGasket.metadata.plugins.push({
      name: '@gasket/plugin-fastify'
    })
    const meta = metadata(mockGasket, {});
    const fastifyLifecycles = meta.lifecycles.filter(data => data.description.includes('Fastify'))
    assume(fastifyLifecycles).length(2)
    assume(fastifyLifecycles[0]).property('name', 'next')
    assume(fastifyLifecycles[1]).property('name', 'nextFastify')

    const expressLifecycles = meta.lifecycles.filter(data => data.description.includes('Express'))
    assume(expressLifecycles).length(0)
  });

  it('includes express AND fastify lifecycles for both plugin', function () {
    mockGasket.metadata.plugins.push({
      name: '@gasket/plugin-express'
    },{
      name: '@gasket/plugin-fastify'
    })
    const meta = metadata(mockGasket, {});

    // Express
    const expressLifecycles = meta.lifecycles.filter(data => data.description.includes('Express'))
    assume(expressLifecycles).length(2)
    assume(expressLifecycles[0]).property('name', 'next')
    assume(expressLifecycles[1]).property('name', 'nextExpress')

    // Fastify
    const fastifyLifecycles = meta.lifecycles.filter(data => data.description.includes('Fastify'))
    assume(fastifyLifecycles).length(2)
    assume(fastifyLifecycles[0]).property('name', 'next')
    assume(fastifyLifecycles[1]).property('name', 'nextFastify')
  });
});
