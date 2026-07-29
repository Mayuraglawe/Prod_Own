import { describe, it, expect } from 'vitest';
import { scrubContent, scrubMetadata } from '../scrubber';

describe('Ingest Scrubber', () => {
  it('redacts JWT tokens', () => {
    const raw = 'User token is eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c in header';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('[JWT_REDACTED]');
    expect(content).not.toContain('eyJhbGciOiJ');
    expect(redactedPatterns).toContain('jwt');
  });

  it('redacts Bearer tokens', () => {
    const raw = 'Authorization: Bearer secret_token_1234567890_abc';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('Bearer [TOKEN_REDACTED]');
    expect(redactedPatterns).toContain('bearer_token');
  });

  it('redacts Authorization headers', () => {
    const raw = 'Authorization: Basic dXNlcjpwYXNz';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('Authorization: [REDACTED]');
    expect(redactedPatterns).toContain('authorization_header');
  });

  it('redacts AWS Access Key IDs', () => {
    const raw = 'Failed to upload using key AKIAIOSFODNN7EXAMPLE';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('[AWS_KEY_REDACTED]');
    expect(content).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(redactedPatterns).toContain('aws_access_key');
  });

  it('redacts AWS Secret Access Keys', () => {
    const raw = 'aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('[AWS_SECRET_REDACTED]');
    expect(redactedPatterns).toContain('aws_secret_key');
  });

  it('redacts PEM private keys', () => {
    const raw = 'Key dump:\n-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\nDone';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('[PRIVATE_KEY_REDACTED]');
    expect(content).not.toContain('MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC');
    expect(redactedPatterns).toContain('pem_private_key');
  });

  it('redacts database connection strings', () => {
    const raw = 'Connection failed: postgresql://admin:secretPass123@db.example.com:5432/main_db';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('postgresql://[USER]:[PASS]@db.example.com:5432/main_db');
    expect(content).not.toContain('secretPass123');
    expect(redactedPatterns).toContain('connection_string');
  });

  it('redacts email addresses', () => {
    const raw = 'Error reported by user john.doe@company.org in session';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('[EMAIL_REDACTED]');
    expect(content).not.toContain('john.doe@company.org');
    expect(redactedPatterns).toContain('email_address');
  });

  it('redacts credit card numbers', () => {
    const raw = 'Payment processing failed for card 4532 0152 7894 1234';
    const { content, redactedPatterns } = scrubContent(raw);
    expect(content).toContain('[CARD_REDACTED]');
    expect(content).not.toContain('4532 0152 7894 1234');
    expect(redactedPatterns).toContain('credit_card');
  });

  it('scrubs metadata records', () => {
    const metadata = {
      userEmail: 'user@example.com',
      apiKey: 'api_key_secret_1234567890_value',
      status: 500,
    };
    const scrubbed = scrubMetadata(metadata);
    expect(scrubbed?.userEmail).toBe('[EMAIL_REDACTED]');
    expect(scrubbed?.apiKey).toContain('[CREDENTIAL_REDACTED]');
    expect(scrubbed?.status).toBe('500');
  });
});
