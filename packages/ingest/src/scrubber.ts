/**
 * Regex patterns used to redact sensitive credentials before any persistence or queueing.
 * Each pattern includes a human-readable label for audit logging.
 *
 * Security rule: scrub BEFORE persistence, never after.
 */
const SCRUB_PATTERNS: Array<{ label: string; pattern: RegExp; replacement: string }> = [
  {
    label: 'jwt',
    // Three base64url segments separated by dots — standard JWT structure
    pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    replacement: '[JWT_REDACTED]',
  },
  {
    label: 'bearer_token',
    pattern: /Bearer\s+[a-zA-Z0-9\-_.~+/]+=*/gi,
    replacement: 'Bearer [TOKEN_REDACTED]',
  },
  {
    label: 'authorization_header',
    pattern: /Authorization:\s*(?!Bearer\b)\S+/gi,
    replacement: 'Authorization: [REDACTED]',
  },
  {
    label: 'aws_access_key',
    // AWS access key IDs start with AKIA followed by 16 uppercase alphanumeric characters
    pattern: /AKIA[0-9A-Z]{16}/g,
    replacement: '[AWS_KEY_REDACTED]',
  },
  {
    label: 'aws_secret_key',
    pattern: /(?:aws.?secret|secret.?access.?key)[\s:='"]+[a-zA-Z0-9+/]{40}/gi,
    replacement: '[AWS_SECRET_REDACTED]',
  },
  {
    label: 'pem_private_key',
    // PEM-encoded private keys of any type
    pattern: /-----BEGIN[^-]+PRIVATE KEY-----[\s\S]*?-----END[^-]+PRIVATE KEY-----/g,
    replacement: '[PRIVATE_KEY_REDACTED]',
  },
  {
    label: 'connection_string',
    // Redact username:password from DB/Redis/MongoDB connection strings
    pattern: /(postgresql|postgres|mysql|mongodb|redis|amqp):\/\/[^:@/\s]+:[^@/\s]+@/gi,
    replacement: '$1://[USER]:[PASS]@',
  },
  {
    label: 'email_address',
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL_REDACTED]',
  },
  {
    label: 'generic_credential',
    // Common credential key patterns followed by a long opaque value
    pattern: /(?:api[_-]?key|apikey|secret|password|passwd|pwd|token|auth)[\s:='"]+([a-zA-Z0-9\-_.]{16,})/gi,
    replacement: '[CREDENTIAL_REDACTED]',
  },
  {
    label: 'credit_card',
    // 13–16 digit sequences with optional spaces/dashes (Luhn-format approximation)
    pattern: /\b(?:\d[ -]?){13,16}\b/g,
    replacement: '[CARD_REDACTED]',
  },
];

export interface ScrubResult {
  /** The scrubbed content string */
  content: string;
  /** Labels of the patterns that fired, for audit logging */
  redactedPatterns: string[];
}

/**
 * Scrubs a raw content string (error message or stack trace) of secrets, tokens,
 * API keys, emails, and other sensitive values before the payload is persisted
 * or pushed to the Redis ingest stream.
 *
 * This function is pure: it never mutates the input and never throws.
 */
export function scrubContent(raw: string): ScrubResult {
  const redactedPatterns: string[] = [];
  let content = raw;

  for (const { label, pattern, replacement } of SCRUB_PATTERNS) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      redactedPatterns.push(label);
    }
  }

  return { content, redactedPatterns };
}

/**
 * Scrubs a metadata record by serialising each value to a string,
 * running the scrubber, and rebuilding the record.
 */
export function scrubMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      const target = `${key}: ${stringified}`;
      const { content } = scrubContent(target);
      const scrubbedValue = content.startsWith(`${key}: `)
        ? content.slice(key.length + 2)
        : content;
      return [key, scrubbedValue];
    })
  );
}
