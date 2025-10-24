import { vi } from 'vitest';
import { promptSwagger } from '../lib/prompt.js';

describe('promptSwagger', () => {
  let context, mockPrompt, mockAnswers;

  beforeEach(() => {
    context = {};
    mockAnswers = { useSwagger: false };
    mockPrompt = vi.fn().mockImplementation(() => mockAnswers);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });


  it('sets useSwagger to false', async () => {
    const result = await promptSwagger(context, mockPrompt);
    expect(result.useSwagger).toEqual(false);
  });

  it('promptSwagger', async () => {
    await promptSwagger(context, mockPrompt);
    expect(mockPrompt).toHaveBeenCalledWith([
      {
        name: 'useSwagger',
        message: 'Do you want to use Swagger?',
        type: 'confirm',
        default: true
      }
    ]);
  });
});
