import { expect } from '@jest/globals';

const module  = await import('../lib/gasket.js');

describe('index', () => {
  it('has expected exports', () => {
    const expected = [
      'Gasket',
      'makeGasket'
    ];

    expected.forEach(property => {
      expect(module).toHaveProperty(property);
    });
    expect(Object.keys(module)).toHaveLength(expected.length);
  });
});
