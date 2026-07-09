import { buildApp } from './server';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

await app.listen({ port, host });
