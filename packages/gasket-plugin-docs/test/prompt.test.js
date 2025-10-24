import { vi } from 'vitest';
import prompt from '../lib/prompt.js';

describe('prompt', () => {
  let mockContext, mockPrompt;

  beforeEach(() => {
    mockContext = {};
    mockPrompt = vi.fn();
  });

  it('prompts for docs plugins', async () => {
    mockPrompt.mockResolvedValueOnce({ useDocs: true });
    const result = await prompt({}, mockContext, { prompt: mockPrompt });
    expect(result).toEqual({ useDocs: true });
  });

  it('does not prompt if useDocs already in context', async () => {
    mockContext.useDocs = true;
    const result = await prompt({}, mockContext, { prompt: mockPrompt });
    expect(result).toEqual({ useDocs: true });
    expect(mockPrompt).not.toHaveBeenCalled();
  });
});
