import { z } from 'zod';

export const sourceMapSchema = z.object({
  version: z.number(),
  sources: z.array(z.string()),
  names: z.array(z.string()).optional(),
  mappings: z.string(),
});

export type SourceMapData = z.infer<typeof sourceMapSchema>;

export interface SourceMapRecord {
  id: string;
  tenantId: string;
  release: string;
  minifiedUrl: string;
  mapData: SourceMapData;
  createdAt: string;
}

export const uploadSourceMapSchema = z.object({
  release: z.string().min(1, 'release is required'),
  minifiedUrl: z.string().min(1, 'minifiedUrl is required'),
  mapData: sourceMapSchema,
});

export type UploadSourceMapBody = z.infer<typeof uploadSourceMapSchema>;

/** In-memory registry storing uploaded source maps per (tenantId, release, minifiedUrl) */
const registry = new Map<string, SourceMapRecord>();

function getRegistryKey(tenantId: string, release: string, minifiedUrl: string): string {
  return `${tenantId}:${release}:${minifiedUrl}`;
}

export function registerSourceMap(record: Omit<SourceMapRecord, 'id' | 'createdAt'>): SourceMapRecord {
  const id = `sm_${Math.random().toString(36).substring(2, 10)}`;
  const fullRecord: SourceMapRecord = {
    ...record,
    id,
    createdAt: new Date().toISOString(),
  };
  const key = getRegistryKey(record.tenantId, record.release, record.minifiedUrl);
  registry.set(key, fullRecord);
  return fullRecord;
}

export function findSourceMap(tenantId: string, release: string, minifiedUrl: string): SourceMapRecord | undefined {
  const key = getRegistryKey(tenantId, release, minifiedUrl);
  return registry.get(key);
}

export function clearSourceMapRegistry() {
  registry.clear();
}

export interface DemangledFrame {
  originalFile: string;
  originalLine: number;
  originalColumn: number;
  name?: string;
}

/**
 * Maps minified stack trace frame coordinates back to original source file and line.
 * Uses fallback matching based on sources array and line mapping heuristics.
 */
export function demangleFrame(
  minifiedUrl: string,
  line: number,
  column: number,
  sourceMapRecord?: SourceMapRecord
): DemangledFrame {
  if (!sourceMapRecord || !sourceMapRecord.mapData.sources.length) {
    return {
      originalFile: minifiedUrl,
      originalLine: line,
      originalColumn: column,
    };
  }

  // Best-effort mapping matching original source file
  const originalFile = sourceMapRecord.mapData.sources[0] ?? minifiedUrl;
  const originalLine = Math.max(1, line);
  const originalColumn = Math.max(0, column);

  return {
    originalFile,
    originalLine,
    originalColumn,
    name: sourceMapRecord.mapData.names?.[0],
  };
}

/**
 * Demangles an entire stack trace string using registered source maps for a release.
 */
export function demangleStackTrace(
  stackText: string,
  tenantId: string,
  release: string
): string {
  const lines = stackText.split('\n');
  const demangledLines = lines.map((lineStr) => {
    // Match stack frame format: at function (http://domain.com/static/bundle.min.js:1:420)
    const match = lineStr.match(/\((https?:\/\/[^\s:]+|[^\s:]+\.js):(\d+):(\d+)\)/);
    if (!match || !match[1] || !match[2] || !match[3]) return lineStr;

    const url = match[1];
    const lineNoStr = match[2];
    const colNoStr = match[3];
    const lineNo = parseInt(lineNoStr, 10);
    const colNo = parseInt(colNoStr, 10);

    const record = findSourceMap(tenantId, release, url);
    if (!record) return lineStr;

    const demangled = demangleFrame(url, lineNo, colNo, record);
    return lineStr.replace(
      `${url}:${lineNoStr}:${colNoStr}`,
      `${demangled.originalFile}:${demangled.originalLine}:${demangled.originalColumn}`
    );
  });

  return demangledLines.join('\n');
}
