const prompt = require('../lib/prompt');

describe('prompt', () => {

  it('does not contain a prompt hook', () => {
    expect(prompt.prompt).toBeUndefined();
  });

  describe('exports', () => {

    it('promptTypescript', () => {
      expect(prompt.promptTypescript).toBeDefined();
      expect(prompt.promptTypescript).toBeInstanceOf(Function);
      expect(prompt.promptTypescript.constructor.name).toBe('AsyncFunction');
    });
  });
});
