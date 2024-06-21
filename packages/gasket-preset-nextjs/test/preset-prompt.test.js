import { jest } from '@jest/globals';
import preset from '../lib/index.js';

describe('presetPrompt', () => {
  let presetPrompt, mockContext, mockPrompt, mockAnswers;

  beforeEach(() => {
    mockContext = {};
    mockAnswers = { typescript: false };
    mockPrompt = { prompt: jest.fn().mockImplementation(() => mockAnswers) };
    presetPrompt = preset.hooks.presetPrompt;
  });

  it('is an async function', () => {
    expect(typeof presetPrompt).toBe('function');
    expect(presetPrompt.constructor.name).toBe('AsyncFunction');
  });

  it('does not prompt if context.typescript exists', async () => {
    mockContext.typescript = true;
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).toHaveBeenCalledTimes(4);
    const expected = [
      [[expect.objectContaining({ name: 'useAppRouter' })]],
      [[expect.objectContaining({ name: 'nextServerType' })]],
      [[expect.objectContaining({ name: 'server' })]],
      [[expect.objectContaining({ name: 'addSitemap' })]]
    ];
    expect(mockPrompt.prompt.mock.calls).toEqual(expected);
  });

  it('prompts for typescript', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    const first = mockPrompt.prompt.mock.calls[0][0][0];
    expect(mockPrompt.prompt).toHaveBeenCalled();
    expect(first.name).toEqual('typescript');
  });

  it('prompts for appRouter', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    const second = mockPrompt.prompt.mock.calls[1][0][0];
    expect(mockPrompt.prompt).toHaveBeenCalled();
    expect(second.name).toEqual('useAppRouter');
  });

  it('prompts for nextServerType', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    const third = mockPrompt.prompt.mock.calls[2][0][0];
    expect(mockPrompt.prompt).toHaveBeenCalled();
    expect(third.name).toEqual('nextServerType');
  });

  it('prompts for nextDevProxy when defaultServer', async () => {
    mockContext.nextServerType = 'defaultServer';
    await presetPrompt({}, mockContext, mockPrompt);
    const first = mockPrompt.prompt.mock.calls[2][0][0];
    expect(mockPrompt.prompt).toHaveBeenCalled();
    expect(first.name).toEqual('nextDevProxy');
  });

  it('prompts for server', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    const second = mockPrompt.prompt.mock.calls[3][0][0];
    expect(mockPrompt.prompt).toHaveBeenCalledTimes(5);
    expect(second.name).toEqual('server');
  });

  it('prompts for addSitemap', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    const first = mockPrompt.prompt.mock.calls[4][0][0];
    expect(mockPrompt.prompt).toHaveBeenCalled();
    expect(first.name).toEqual('addSitemap');
  });

  it('does not prompt for server is nextServerType === defaultServer', async () => {
    mockContext.nextServerType = 'defaultServer';
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).toHaveBeenCalledTimes(4);
    const expected = [
      [[expect.objectContaining({ name: 'typescript' })]],
      [[expect.objectContaining({ name: 'useAppRouter' })]],
      [[expect.objectContaining({ name: 'nextDevProxy' })]],
      [[expect.objectContaining({ name: 'addSitemap' })]]
    ];
    expect(mockPrompt.prompt.mock.calls).toEqual(expected);
  });
});
