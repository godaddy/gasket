import { describe, it, expect } from 'vitest';

describe('index', () => {
  it('has expected exports', async () => {
    const mod = await import('../src/index');

    const expected = [
      'gasketData',
      'resolveGasketData'
    ];

    expect(Object.keys(mod)).toEqual(expect.arrayContaining(expected));
  });
});
