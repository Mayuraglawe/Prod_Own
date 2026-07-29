import { describe, it, expect } from 'vitest';
import { fingerprint } from '../fingerprinter';

describe('Ingest Fingerprinter', () => {
  it('groups errors differing only by line and column numbers', () => {
    const stack1 = `TypeError: Cannot read property 'id' of undefined
    at getUser (/app/src/services/user.ts:42:15)
    at handleRequest (/app/src/controllers/api.ts:108:3)`;

    const stack2 = `TypeError: Cannot read property 'id' of undefined
    at getUser (/app/src/services/user.ts:48:22)
    at handleRequest (/app/src/controllers/api.ts:115:9)`;

    const res1 = fingerprint(stack1);
    const res2 = fingerprint(stack2);

    expect(res1.fingerprint).toBe(res2.fingerprint);
    expect(res1.title).toBe("TypeError: Cannot read property 'id' of undefined");
  });

  it('normalises hex memory addresses', () => {
    const stack1 = 'Error: Segfault at 0x7f8a9b2c3d4e in native module';
    const stack2 = 'Error: Segfault at 0x1a2b3c4d5e6f in native module';

    const res1 = fingerprint(stack1);
    const res2 = fingerprint(stack2);

    expect(res1.fingerprint).toBe(res2.fingerprint);
    expect(res1.normalisedContent).toContain('0xADDR');
  });

  it('normalises absolute file paths across environments', () => {
    const stackUnix = `Error: DB Timeout
    at query (/var/www/app/src/db/client.ts:10:5)`;

    const stackWin = `Error: DB Timeout
    at query (C:\\Users\\Admin\\project\\src\\db\\client.ts:10:5)`;

    const resUnix = fingerprint(stackUnix);
    const resWin = fingerprint(stackWin);

    expect(resUnix.title).toBe('Error: DB Timeout');
    expect(resWin.title).toBe('Error: DB Timeout');
    expect(resUnix.fingerprint).toBe(resWin.fingerprint);
  });

  it('normalises semver version strings in stack traces', () => {
    const stackV1 = 'Error: Module loaded v1.2.3 failed at init';
    const stackV2 = 'Error: Module loaded v2.0.1 failed at init';

    const res1 = fingerprint(stackV1);
    const res2 = fingerprint(stackV2);

    expect(res1.fingerprint).toBe(res2.fingerprint);
    expect(res1.normalisedContent).toContain('vX.X.X');
  });

  it('truncates title to 200 characters', () => {
    const longLine = 'Error: ' + 'A'.repeat(300);
    const res = fingerprint(longLine);

    expect(res.title.length).toBe(200);
  });
});
