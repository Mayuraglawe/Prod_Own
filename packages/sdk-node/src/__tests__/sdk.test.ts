import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init, resetSdkForTesting } from '../index';

describe('SDK Node Package', () => {
  beforeEach(() => {
    resetSdkForTesting();
    vi.restoreAllMocks();
  });

  it('initializes cleanly with options', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    init({
      endpoint: 'http://localhost:3000/api/ingest',
      apiKey: 'test_api_key_123',
      environment: 'production',
      release: 'v2.1.0',
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[prod-own] SDK initialized for environment: production, release: v2.1.0')
    );
  });

  it('prevents double initialization', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init({ endpoint: 'http://localhost:3000/api/ingest' });
    init({ endpoint: 'http://localhost:3000/api/ingest' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('@litetrace/sdk-node is already initialized.')
    );
  });
});
