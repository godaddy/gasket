import { vi } from 'vitest';
import buildSwaggerDefinition from '../lib/build-swagger-definition.js';
import postCreateHook from '../lib/post-create.js';

vi.mock('../lib/build-swagger-definition.js', ()  => ({ default: vi.fn() }));

describe('postCreateHook', function () {
  let mockGasket, mockCreateContext;
  beforeEach(() => {
    mockGasket =  {};
    mockCreateContext = {
      dest: '/path/to/app',
      gasketConfig: {
        fields: {
          swagger: {
            jsdoc: {
              definition: {
                info: {
                  version: '0.0.0'
                }
              },
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
          definition: {
            info: {
              version: '0.0.0'
            }
          },
          apis: ['/path/to/app/fake.js', '/path/to/app/another-api.js']
        }
      }
    });
  });
});
