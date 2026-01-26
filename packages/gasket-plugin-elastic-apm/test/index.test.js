/* eslint-disable no-process-env */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import plugin from '../lib/index.js';
import { readFileSync } from 'fs';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version, description } = pkg;

const apmGeneric = {
  start: vi.fn(),
  addFilter: vi.fn()
};

const mockAPM = {
  start: vi.fn().mockReturnValue(apmGeneric),
  addFilter: vi.fn().mockReturnValue(apmGeneric),
  isStarted: vi.fn()
};

vi.mock('elastic-apm-node', () => ({ default: mockAPM }));

describe('Plugin', () => {

  beforeEach(function () {
    mockAPM.isStarted.mockReset();
    process.env.ELASTIC_APM_SERVER_URL = 'FAKE_ELASTIC_APM_URL';
    process.env.ELASTIC_APM_SECRET_TOKEN = 'TOKEN_1234';
  });

  afterEach(function () {
    vi.clearAllMocks();

    delete process.env.ELASTIC_APM_SERVER_URL;
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    delete process.env.ELASTIC_APM_ACTIVE;
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'metadata'
    ];

    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});
