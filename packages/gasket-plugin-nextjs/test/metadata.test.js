const metadata = require('../lib/metadata');

describe('metadata', function () {
  let mockGasket;

  beforeEach(async function () {
    mockGasket = {
      config: {
        plugins: [
          { name: '@gasket/plugin-express' }
        ]
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('outputs expected categories', async function () {
    const meta = await metadata(mockGasket, {});
    const expected = [
      'actions',
      'guides',
      'lifecycles',
      'structures',
      'configurations'
    ];

    const keys = Object.keys(meta);
    expect(keys).toEqual(expected);
    expect(keys).toHaveLength(expected.length);
  });

  it('includes express lifecycles for express plugin', async function () {
    const meta = await metadata(mockGasket, {});
    const expressLifecycles = meta.lifecycles.filter(data => data.description.includes('Express'));
    expect(expressLifecycles).toHaveLength(2);
    expect(expressLifecycles[0]).toHaveProperty('name', 'next');
    expect(expressLifecycles[1]).toHaveProperty('name', 'nextExpress');

    const fastifyLifecycles = meta.lifecycles.filter(data => data.description.includes('Fastify'));
    expect(fastifyLifecycles).toHaveLength(0);
  });

  it('includes fastify lifecycles for fastify plugin', async function () {
    mockGasket.config.plugins = [{ name: '@gasket/plugin-fastify' }];
    const meta = await metadata(mockGasket, {});
    const fastifyLifecycles = meta.lifecycles.filter(data => data.description.includes('Fastify'));
    expect(fastifyLifecycles).toHaveLength(2);
    expect(fastifyLifecycles[0]).toHaveProperty('name', 'next');
    expect(fastifyLifecycles[1]).toHaveProperty('name', 'nextFastify');

    const expressLifecycles = meta.lifecycles.filter(data => data.description.includes('Express'));
    expect(expressLifecycles).toHaveLength(0);
  });

  it('includes express AND fastify lifecycles for both plugin', async function () {
    mockGasket.config.plugins.push({ name: '@gasket/plugin-fastify' });
    const meta = await metadata(mockGasket, {});

    // Express
    const expressLifecycles = meta.lifecycles.filter(data => data.description.includes('Express'));
    expect(expressLifecycles).toHaveLength(2);
    expect(expressLifecycles[0]).toHaveProperty('name', 'next');
    expect(expressLifecycles[1]).toHaveProperty('name', 'nextExpress');

    // Fastify
    const fastifyLifecycles = meta.lifecycles.filter(data => data.description.includes('Fastify'));
    expect(fastifyLifecycles).toHaveLength(2);
    expect(fastifyLifecycles[0]).toHaveProperty('name', 'next');
    expect(fastifyLifecycles[1]).toHaveProperty('name', 'nextFastify');
  });
});
