import { buildApp } from './server';

// Server binding port configuration (default to 3001 for dev)
const port = Number(process.env.PORT ?? 3001);
// Server binding interface host configuration (default to 0.0.0.0 for containerized deployment compatibility)
const host = process.env.HOST ?? '0.0.0.0';

// Construct the Fastify web server application
const app = await buildApp();

// Bind and start listening for HTTP requests
await app.listen({ port, host });

