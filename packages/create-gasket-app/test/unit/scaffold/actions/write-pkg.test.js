import { jest } from '@jest/globals';
import path from 'path';

const mockWriteStub = jest.fn();

jest.unstable_mockModule('fs/promises', () => ({
  writeFile: mockWriteStub
}));

const { ConfigBuilder } = await import('../../../../lib/scaffold/config-builder.js');
const writePkg = (await import('../../../../lib/scaffold/actions/write-pkg')).default;

describe('write-pkg', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app',
      pkg: ConfigBuilder.createPackageJson({
        name: 'my-app',
        version: '0.0.0'
      }),
      generatedFiles: new Set()
    };
  });

  afterEach(() => {

  });

  it('is decorated action', async () => {
    expect(writePkg).toHaveProperty('wrapped');
  });

  it('writes the package.json file under destination', async () => {
    mockWriteStub.mockResolvedValue();
    await writePkg({ context: mockContext });
    expect(mockWriteStub).toHaveBeenCalledWith(path.join(mockContext.dest, 'package.json'), expect.any(String), 'utf8');
  });

  it('writes pretty JSON from pkg', async () => {
    mockWriteStub.mockResolvedValue();
    await writePkg({ context: mockContext });
    const expected = JSON.stringify(mockContext.pkg, null, 2);
    expect(mockWriteStub.mock.calls[0][1]).toEqual(expected);
  });
});
