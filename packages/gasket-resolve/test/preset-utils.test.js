const { flattenPresets } = require('../lib/preset-utils');

describe('flattenPresets', () => {
  it('returns empty array if no presets', () => {
    const results = flattenPresets();
    expect(results).toEqual([]);
  });

  it('returns same array if no extended presets', () => {
    const results = flattenPresets([
      { name: 'one' },
      { name: 'two', presets: [] }
    ]);
    expect(results).toEqual([
      { name: 'one' },
      { name: 'two', presets: [] }
    ]);
  });

  it('flattens extended presets', () => {
    const results = flattenPresets([
      { name: 'one' },
      {
        name: 'two', presets: [
          { name: 'two-a' },
          {
            name: 'two-b', presets: [
              { name: 'two-b-1' },
              { name: 'two-b-2' }
            ]
          }
        ]
      }
    ]);
    expect(results.map(p => p.name)).toEqual([
      'one', 'two', 'two-a', 'two-b', 'two-b-1', 'two-b-2'
    ]);
  });

  it('flattens presets ordered by depth as parents before children', () => {
    const results = flattenPresets([
      {
        name: 'one', presets: [
          { name: 'one-a' },
          {
            name: 'one-b', presets: [
              { name: 'one-b-1' },
              { name: 'one-b-2' }
            ]
          }
        ]
      },
      {
        name: 'two', presets: [
          { name: 'two-a' },
          {
            name: 'two-b', presets: [
              { name: 'two-b-1' },
              { name: 'two-b-2' }
            ]
          }
        ]
      }
    ]);
    expect(results.map(p => p.name)).toEqual([
      'one', 'two', 'one-a', 'one-b', 'two-a', 'two-b', 'one-b-1', 'one-b-2', 'two-b-1', 'two-b-2'
    ]);
  });
});
