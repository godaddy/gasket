import { jest, expect } from '@jest/globals';
global.jest = jest;
global.expect = expect;
process.env.GASKET_ENV = 'test';
