import { logo } from '../../lib/utils/logo.js';

describe('logo', () => {

  it('should be defined', () => {
    expect(logo).toBeDefined();
  });

  it('should be a string', () => {
    expect(typeof logo).toBe('string');
  });

  it('should match', () => {
    const test = `
          ▄▄▄▄████▀▀█▄
      ▄███▀▀▀▀▀▀▀█▄▄██
    ▄██▀   ▄▄▄▄▄   ▀██▌                  ▄▄▄
  ▄██▀   ███▀▀▀▀█    ██                   ██              ██
 █▀▀█   ██▌          ▐█▌  ▄▀▀▀█▄  ▄█▀▀▀▄  ██ ▐██▀ ▄█▀▀█▄ ▀██▀▀
 █▄▄█   ██▌   ▀▀██   ▐█▌  ▄▄▄▄██  ▀▀█▄▄▄  █████   ██▄▄██  ██
  ▀██▄   ███▄▄▄▄██   ██   ▀▄▄▄▀█▄ ▀▄▄▄█▀ ▄██▄ ██▄ ▀█▄▄▄▄  ▀█▄▄
    ▀██▄   ▀▀▀  ▀▀ ▄██▌
      ▀███▄▄▄▄▄▄▄█▀▀██
          ▀▀▀▀████▄▄█▀
`;
    expect(logo).toEqual(test);
  });
});
