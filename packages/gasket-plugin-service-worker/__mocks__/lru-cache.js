import { vi } from 'vitest';

const getStub = vi.fn();
const setStub = vi.fn();

const mockCache = vi.fn(() => ({
  get: getStub,
  set: setStub
}));

mockCache.getStub = getStub;
mockCache.setStub = setStub;

export default mockCache;
