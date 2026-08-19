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

  it('rejects requests that exceed the rate limit', () => {
    const gateway = new ApiGateway();
    let lastResponseCode = 200;
    let responseBody = '';

    const mockResponse = {
      statusCode: 200,
      setHeader: () => {},
      end: (body: string) => {
        responseBody = body;
      },
    };

    // Fire 100 successful authenticated requests
    for (let i = 0; i < 100; i++) {
      gateway.handleRequest(
        { url: '/api/v1/ingest/store', headers: { 'x-api-key': 'test-client-key' }, method: 'POST' },
        mockResponse
      );
    }

    // The 101st request should be rate-limited
    mockResponse.statusCode = 200; // reset status code
    gateway.handleRequest(
      { url: '/api/v1/ingest/store', headers: { 'x-api-key': 'test-client-key' }, method: 'POST' },
      mockResponse
    );

    expect(mockResponse.statusCode).toBe(429);
    expect(responseBody).toContain('RATE_LIMIT_EXCEEDED');
  });
});

