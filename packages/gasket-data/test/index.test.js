describe('index', () => {
  it('has expected exports', async () => {
    const mod = await import('../lib/index.js');

    const expected = [
      'gasketData',
      'resolveGasketData'
    ];

    expect(Object.keys(mod)).toEqual(expect.arrayContaining(expected));
  });
});
