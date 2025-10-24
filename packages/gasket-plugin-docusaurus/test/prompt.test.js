import promptHook from '../lib/prompt.js';
import { vi } from 'vitest';

describe('promptHook', () => {
  let mockContext, prompt;

  beforeEach(() => {
    mockContext = {};
    prompt = vi.fn();
  });

  it('does not prompt useDocs is false', async () => {
    mockContext.useDocs = false;
    const result = await promptHook({}, mockContext, { prompt });
    expect(result).toEqual(mockContext);
  });

  it('does not prompt if useDocusaurus is already in context', async () => {
    mockContext.useDocusaurus = true;
    const result = await promptHook({}, mockContext, { prompt });
    expect(result).toEqual(mockContext);
  });

  it('prompts for useDocusaurus', async () => {
    prompt.mockResolvedValueOnce({ useDocusaurus: true });
    const result = await promptHook({}, mockContext, { prompt });
    expect(result).toEqual({ useDocusaurus: true });
  });
});
