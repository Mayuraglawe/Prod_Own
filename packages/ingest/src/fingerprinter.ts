import crypto from 'crypto';

/**
 * Normalisation patterns applied to a stack trace before fingerprinting.
 * The goal is to produce the same fingerprint even when line numbers, memory
 * addresses, or absolute file paths change between deployments.
 */
const NORMALISE_PATTERNS: Array<{ label: string; pattern: RegExp; replacement: string }> = [
  {
    label: 'line_col_numbers',
    // Strip line:col suffixes like ":123:45" inside parentheses from stack frames
    pattern: /:\d+:\d+/g,
    replacement: '',
  },
  {
    label: 'hex_addresses',
    // Memory addresses like "0x7f8a9b2c3d4e"
    pattern: /0x[0-9a-fA-F]+/g,
    replacement: '0xADDR',
  },
  {
    label: 'absolute_unix_paths',
    // Strip leading absolute path up to the project root (heuristic: up to /src/ or /dist/)
    pattern: /\/(?:[^/\s]+\/)*(?=(?:src|dist|node_modules)\/)/g,
    replacement: '',
  },
  {
    label: 'absolute_windows_paths',
    // Windows absolute paths like "C:\Users\..." or "D:\project\..."
    pattern: /[A-Z]:\\(?:[^\\]+\\)*(?=(?:src|dist|node_modules)\\)/gi,
    replacement: '',
  },
  {
    label: 'at_anonymous',
    // Anonymous call sites
    pattern: /at <anonymous>/g,
    replacement: 'at [anonymous]',
  },
  {
    label: 'eval_origins',
    // Eval origin suffixes like ", <anonymous>:1:1"
    pattern: /,\s*<[^>]+>:\d+:\d+/g,
    replacement: '',
  },
  {
    label: 'semver_versions',
    // Version strings like "v1.2.3" or "(1.2.3)"
    pattern: /v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?/g,
    replacement: 'vX.X.X',
  },
  {
    label: 'node_internals',
    // Internal Node.js module prefixes like "node:internal/..."
    pattern: /node:internal\/[^\s)]+/g,
    replacement: 'node:internal/[...]',
  },
];

export interface FingerprintResult {
  /** SHA-256 hex fingerprint of the normalised stack */
  fingerprint: string;
  /** The first non-empty line (error type + message) used as issue title */
  title: string;
  /** The normalised stack trace used for hashing (useful for debugging) */
  normalisedContent: string;
}

/**
 * Extracts the first meaningful line of an error string to use as an issue title.
 * Truncates to 200 characters.
 */
function extractTitle(content: string): string {
  const firstLine = content
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return (firstLine ?? 'Unknown Error').substring(0, 200);
}

/**
 * Normalises a stack trace string by removing volatile elements (line numbers,
 * memory addresses, absolute paths) so that the same logical error always
 * produces the same fingerprint across restarts and deployments.
 */
function normaliseStack(content: string): string {
  let normalised = content;
  for (const { pattern, replacement } of NORMALISE_PATTERNS) {
    normalised = normalised.replace(pattern, replacement);
  }
  // Collapse multiple blank lines into one
  normalised = normalised.replace(/\n{3,}/g, '\n\n').trim();
  return normalised;
}

/**
 * Generates a stable SHA-256 fingerprint for an error content string.
 *
 * The fingerprint is computed on a normalised stack trace so that errors that
 * differ only in line numbers or memory addresses are grouped together.
 *
 * @param content - The scrubbed error message or stack trace
 */
export function fingerprint(content: string): FingerprintResult {
  const title = extractTitle(content);
  const normalisedContent = normaliseStack(content);
  const hash = crypto.createHash('sha256').update(normalisedContent).digest('hex');

  return { fingerprint: hash, title, normalisedContent };
}
