const buildSwaggerDefinition = require('../lib/build-swagger-definition.js');
const postCreateHook = require('../lib/post-create.js');

jest.mock('../lib/build-swagger-definition.js', ()  => jest.fn());

describe('postCreateHook', function () {
  let mockGasket, mockCreateContext;
  beforeEach(() => {
    mockGasket = {
      config: {
        swagger: {
          jsdoc: {
            apis: ['fake.js']
          }
        }
      }
    };
    mockCreateContext = {
      dest: '/path/to/app',
      gasketConfig: {
        fields: {
          swagger: {
            jsdoc: {
              apis: ['fake.js', './another-api.js']
            }
          }
        }
      }
    };
  });

  it('buildSwaggerDefinition is called with expected parameters', async function () {
    await postCreateHook(mockGasket, mockCreateContext);
    expect(buildSwaggerDefinition).toHaveBeenCalledWith(mockGasket, {
      root: '/path/to/app',
      swagger: {
        jsdoc: {
          apis: ['/path/to/app/fake.js', '/path/to/app/another-api.js']
        }
      }
    });
  });
});
