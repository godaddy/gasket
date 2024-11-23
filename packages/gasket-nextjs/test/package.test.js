import packageJson from '../package.json';

describe('package.json', function () {

  it('has expected exports', () => {
    const expected = [
      '.',
      './document',
      './layout',
      './request',
      './server',
      './package.json'
    ];

    expect(Object.keys(packageJson.exports)).toEqual(expected);
    expect(Object.keys(packageJson.exports)).toHaveLength(expected.length);
  });
});
