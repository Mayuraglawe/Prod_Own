import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerSourceMap,
  findSourceMap,
  demangleFrame,
  demangleStackTrace,
  clearSourceMapRegistry,
} from '../sourcemap';

describe('Source Map Demangling Engine', () => {
  beforeEach(() => {
    clearSourceMapRegistry();
  });

  it('registers and retrieves source map records', () => {
    const record = registerSourceMap({
      tenantId: 'tenant_1',
      release: 'v1.0.0',
      minifiedUrl: 'http://example.com/static/bundle.min.js',
      mapData: {
        version: 3,
        sources: ['src/index.ts', 'src/utils.ts'],
        mappings: 'AAAA;',
      },
    });

    expect(record.id).toMatch(/^sm_/);
    const found = findSourceMap('tenant_1', 'v1.0.0', 'http://example.com/static/bundle.min.js');
    expect(found).toBeDefined();
    expect(found?.mapData.sources[0]).toBe('src/index.ts');
  });

  it('demangles single frame coordinates', () => {
    const record = registerSourceMap({
      tenantId: 'tenant_1',
      release: 'v1.0.0',
      minifiedUrl: 'http://example.com/static/bundle.min.js',
      mapData: {
        version: 3,
        sources: ['src/services/auth.ts'],
        names: ['loginUser'],
        mappings: 'AAAA;',
      },
    });

    const demangled = demangleFrame('http://example.com/static/bundle.min.js', 1, 420, record);
    expect(demangled.originalFile).toBe('src/services/auth.ts');
    expect(demangled.name).toBe('loginUser');
  });

  it('demangles entire stack trace string', () => {
    registerSourceMap({
      tenantId: 'tenant_1',
      release: 'v1.0.0',
      minifiedUrl: 'http://example.com/static/bundle.min.js',
      mapData: {
        version: 3,
        sources: ['src/controllers/userController.ts'],
        mappings: 'AAAA;',
      },
    });

    const minifiedStack = `TypeError: Cannot read property 'id' of undefined
    at getUser (http://example.com/static/bundle.min.js:1:420)
    at dispatch (http://example.com/static/bundle.min.js:1:980)`;

    const demangled = demangleStackTrace(minifiedStack, 'tenant_1', 'v1.0.0');
    expect(demangled).toContain('src/controllers/userController.ts:1:420');
  });
});
