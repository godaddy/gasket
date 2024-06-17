const actions = require('../lib/actions');

describe('actions', () => {
  it('should return an object', () => {
    expect(actions()).toBeInstanceOf(Object);
  });

  describe('getIntlLocale', () => {
    let req, mockGasket, mockLocale;
    beforeEach(() => {
      mockLocale = 'en-CA';
      req = {
        headers: {
          'accept-language': mockLocale
        }
      };
      mockGasket = {
        execWaterfall: jest.fn().mockImplementation(async (lifecycle, content) => content)
      };
    });

    it('executes expected lifecycle', async function () {
      await actions(mockGasket).getIntlLocale(req);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', mockLocale, { req });
    });

    it('should return the locale from the request map if it exists', async () => {
      const result = await actions(mockGasket).getIntlLocale(req);
      expect(result).toBe(mockLocale);
    });
  });

  describe('getIntlMessage', () => {
    let mockGasket, mockGasketDataIntl, mockMessages, mockMessageId, mockDefaultMessage;
    beforeEach(() => {
      mockMessageId = 'test.message';
      mockDefaultMessage = 'Test Message';
      mockMessages = {
        'en-CA': {
          'test.message': 'Test Message'
        }
      };
      mockGasketDataIntl = {
        locale: 'en-CA',
        messages: mockMessages
      };
    });

    it('should return the message from the messages object', () => {
      const result = actions(mockGasket).getIntlMessage(mockGasketDataIntl, mockMessageId, mockDefaultMessage);
      expect(result).toBe(mockMessages['en-CA']['test.message']);
    });

    it('should return the default message if the message is not found', () => {
      const result = actions(mockGasket).getIntlMessage(mockGasketDataIntl, 'not.found', mockDefaultMessage);
      expect(result).toBe(mockDefaultMessage);
    });

    it('should return the message id if no default message is provided', () => {
      const result = actions(mockGasket).getIntlMessage(mockGasketDataIntl, 'not.found');
      expect(result).toBe('not.found');
    });
  });
});
