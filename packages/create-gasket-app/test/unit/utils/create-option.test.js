import { createOption } from '../../../lib/utils/index.js';

describe('createOption', () => {

  it('should be defined', () => {
    expect(createOption).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof createOption).toBe('function');
  });

  it('should create a commander option', () => {
    const definition = {
      options: ['-f, --foo', 'foo option'],
      defaultValue: 'bar',
      conflicts: ['baz'],
      parse: (val) => val.toUpperCase(),
      required: false,
      hidden: true
    };
    const option = createOption(definition);
    expect(option).toBeDefined();
    expect(option).toHaveProperty('flags', '-f, --foo');
    expect(option).toHaveProperty('description', 'foo option');
    expect(option).toHaveProperty('defaultValue', 'bar');
    expect(option).toHaveProperty('conflictsWith', ['baz']);
    expect(option).toHaveProperty('argParser');
    expect(option).toHaveProperty('required', false);
    expect(option).toHaveProperty('hidden', true);
  });
});
