import { describe, it, expect } from 'vitest';
import { ApiGateway } from './index.js';

describe('ApiGateway', () => {
  it('rejects unauthorized requests', () => {
    const gateway = new ApiGateway();
    let responseBody = '';

    gateway.handleRequest(
      { url: '/api/v1/ingest/store', headers: {}, method: 'POST' },
      {
        statusCode: 200,
        setHeader: () => {},
        end: (body) => {
          responseBody = body;
        },
      }
    );

    expect(responseBody).toContain('Unauthorized');
  });

  it('routes ingest requests to write path (Ingestion Service)', () => {
    const gateway = new ApiGateway();
    let responseBody = '';

    gateway.handleRequest(
      { url: '/api/v1/ingest/store', headers: { 'x-api-key': 'test-key' }, method: 'POST' },
      {
        statusCode: 200,
        setHeader: () => {},
        end: (body) => {
          responseBody = body;
        },
      }
    );

    expect(responseBody).toContain('ingestion-service');
  });

  it('routes query requests to read path (Query Service)', () => {
    const gateway = new ApiGateway();
    let responseBody = '';

    gateway.handleRequest(
      { url: '/api/v1/query/issues', headers: { 'x-api-key': 'test-key' }, method: 'GET' },
      {
        statusCode: 200,
        setHeader: () => {},
        end: (body) => {
          responseBody = body;
        },
      }
    );

    expect(responseBody).toContain('query-service');
  });
});
