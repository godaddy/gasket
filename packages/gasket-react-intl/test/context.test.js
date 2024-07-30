import { LocaleFileStatus } from '@gasket/helper-intl';
import { jest } from '@jest/globals';
import { makeContext } from '../lib/context.js';

describe('makeContext', () => {
  let localeHandler, messages, setMessages;

  beforeEach(() => {
    localeHandler = {
      getStatus: jest.fn().mockReturnValue(LocaleFileStatus.notLoaded),
      getAllMessages: jest.fn(),
      load: jest.fn().mockResolvedValue()
    };
    messages = { test_message: 'Test Message' };
    setMessages = jest.fn();
  });

  it('should return an object with expected properties', () => {
    const context = makeContext(localeHandler, messages, setMessages);
    expect(context).toEqual(expect.objectContaining({
      getStatus: expect.any(Function),
      load: expect.any(Function),
      messages
    }));
  });

  it('.getStatus returns single path status', () => {
    const context = makeContext(localeHandler, messages, setMessages);
    const status = context.getStatus('locales');
    expect(localeHandler.getStatus).toHaveBeenCalledWith('locales');
    expect(status).toBe(LocaleFileStatus.notLoaded);
  });

  it('.getStatus returns multiple path status', () => {
    const context = makeContext(localeHandler, messages, setMessages);
    const status = context.getStatus('locales', 'locales/nested');
    expect(localeHandler.getStatus).toHaveBeenCalledWith('locales', 'locales/nested');
    expect(status).toBe(LocaleFileStatus.notLoaded);
  });

  it('.load supports single path and sets messages', async () => {
    const context = makeContext(localeHandler, messages, setMessages);
    await context.load('locales');
    expect(localeHandler.getStatus).toHaveBeenCalledWith('locales');
    expect(localeHandler.load).toHaveBeenCalledWith('locales');
    expect(setMessages).toHaveBeenCalled();
  });

  it('.load supports multiple path and sets messages', async () => {
    const context = makeContext(localeHandler, messages, setMessages);
    await context.load('locales', 'locales/nested');
    expect(localeHandler.getStatus).toHaveBeenCalledWith('locales', 'locales/nested');
    expect(localeHandler.load).toHaveBeenCalledWith('locales', 'locales/nested');
    expect(setMessages).toHaveBeenCalled();
  });

  it('.load does nothing if already loaded', async () => {
    localeHandler.getStatus.mockReturnValue(LocaleFileStatus.loaded);
    const context = makeContext(localeHandler, messages, setMessages);
    await context.load('locales');
    expect(localeHandler.getStatus).toHaveBeenCalledWith('locales');
    expect(localeHandler.load).not.toHaveBeenCalled();
    expect(setMessages).not.toHaveBeenCalled();
  });

  it('.messages contains expected messages', async () => {
    const context = makeContext(localeHandler, messages, setMessages);
    expect(context.messages).toBe(messages);
  });
});
