import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { logo } from '../../lib/utils/logo.js';

describe('logo', () => {

  it('should be defined', () => {
    assert.ok(logo);
  });

  it('should be a string', () => {
    assert.equal(typeof logo, 'string');
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
    assert.equal(logo, test);
  });
});
