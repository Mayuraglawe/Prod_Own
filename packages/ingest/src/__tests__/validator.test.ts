import { describe, it, expect } from 'vitest';
import { validateRawIngestBody, validateIngestPayload } from '../validator';

describe('Ingest Validator', () => {
  it('validates raw body with content', () => {
    const valid = {
      sourceId: 'src_123',
      content: 'TypeError: undefined is not a function',
      environment: 'production',
      release: 'v1.0.0',
    };
    const result = validateRawIngestBody(valid);
    expect(result.sourceId).toBe('src_123');
    expect(result.content).toBe('TypeError: undefined is not a function');
  });

  it('accepts legacy error field name', () => {
    const legacy = {
      sourceId: 'src_456',
      error: 'Legacy error stack trace string',
    };
    const result = validateRawIngestBody(legacy);
    expect(result.error).toBe('Legacy error stack trace string');
  });

  it('throws validation error when both content and error are missing', () => {
    const invalid = {
      sourceId: 'src_789',
    };
    expect(() => validateRawIngestBody(invalid)).toThrow();
  });

  it('validates internal ingest payload for stream', () => {
    const streamPayload = {
      tenantId: 'tenant_1',
      sourceId: 'source_1',
      content: 'Error: Database connection lost',
      environment: 'staging',
      release: 'sha_abcdef',
    };
    const result = validateIngestPayload(streamPayload);
    expect(result.tenantId).toBe('tenant_1');
    expect(result.content).toBe('Error: Database connection lost');
  });
});
