import { describe, it, expect } from 'vitest';
import { getOperation, operations } from '../src/operations/index.js';

describe('operations', () => {
  it('getOperation returns module for known operations', () => {
    expect(getOperation('build')).toBeDefined();
    expect(getOperation('build').name).toBe('build');
    expect(getOperation('build').mode).toBe('per-template');
    expect(getOperation('npm-ci').name).toBe('npm-ci');
    expect(getOperation('update-deps').name).toBe('update-deps');
    expect(getOperation('validate-dotfiles').name).toBe('validate-dotfiles');
  });

  it('getOperation returns null for unknown operation', () => {
    expect(getOperation('unknown')).toBeNull();
    expect(getOperation('')).toBeNull();
  });

  it('all operations have name, description, emoji, mode, handler', () => {
    for (const [key, op] of Object.entries(operations)) {
      expect(op.name).toBe(key);
      expect(typeof op.description).toBe('string');
      expect(typeof op.emoji).toBe('string');
      expect(['per-template', 'cross-template']).toContain(op.mode);
      expect(typeof op.handler).toBe('function');
    }
  });
});
