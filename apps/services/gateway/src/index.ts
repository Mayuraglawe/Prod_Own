import http from 'http';

export interface RateLimiter {
  isRateLimited(key: string, limit: number, windowSeconds: number): boolean;
}

export class InMemoryRateLimiter implements RateLimiter {
  private requests = new Map<string, number[]>();

  public isRateLimited(key: string, limit: number, windowSeconds: number): boolean {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const timestamps = (this.requests.get(key) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
      return true;
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);
    return false;
  }
}

/**
 * The ApiGateway serves as the public-facing HTTP surface for the LiteTrace platform.
 * 
 * Architecture Role:
 * It handles raw incoming traffic from client SDKs and Dashboard frontends. 
 * Its primary responsibilities are enforcing authentication (API Keys, Bearer tokens), 
 * executing fast-path rate limiting, and routing valid requests to the appropriate 
 * internal CQRS microservices (e.g., Ingestion Service for writes, Query Service for reads).
 */
export class ApiGateway {
  private rateLimiter = new InMemoryRateLimiter();

  public handleRequest(
    req: { url?: string; headers: Record<string, string | string[] | undefined>; method?: string },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (body: string) => void }
  ): void {
    const url = req.url || '/';

    // Rate limiting check
    const clientKey = req.headers['x-api-key'] || req.headers['x-forwarded-for'] || 'anonymous';
    if (this.rateLimiter.isRateLimited(String(clientKey), 100, 60)) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED' }));
      return;
    }

    // Auth check
    const authHeader = req.headers['authorization'] || req.headers['x-api-key'];
    if (!authHeader && !url.startsWith('/health')) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unauthorized', code: 'MISSING_CREDENTIALS' }));
      return;
    }

    // CQRS Route Forwarding
    if (url.startsWith('/api/v1/ingest')) {
      // Ingest Write Route -> Ingestion Service
      res.statusCode = 202;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ACCEPTED', targetService: 'ingestion-service', path: url }));
    } else if (url.startsWith('/api/v1/query') || url.startsWith('/api/v1/issues')) {
      // Query Read Route -> Query/API Service
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'SUCCESS', targetService: 'query-service', path: url }));
    } else if (url === '/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'OK', service: 'api-gateway' }));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Route Not Found' }));
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  const gateway = new ApiGateway();
  const server = http.createServer((req, res) => {
    // CORS configuration for cross-origin requests from Vercel frontend
    const allowedOrigin = process.env.CORS_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-tenant-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const resProxy = {
      statusCode: 200,
      setHeader: (k: string, v: string) => res.setHeader(k, v),
      end: (b: string) => {
        res.statusCode = resProxy.statusCode;
        res.end(b);
      },
    };

    gateway.handleRequest(
      { url: req.url, headers: req.headers as Record<string, string | string[] | undefined>, method: req.method },
      resProxy
    );
  });
  const port = process.env.PORT || 8000;
  server.listen(port, () => console.log(`[API Gateway] Listening on port ${port}`));
}
