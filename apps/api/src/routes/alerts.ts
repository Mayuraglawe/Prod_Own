import type { FastifyPluginAsync } from 'fastify';

import { createAlertQueue } from '@prod-own/queue';

export const registerAlertRoutes: FastifyPluginAsync = async (app) => {
  app.post('/alerts/slack', async (request, reply) => {
    const queue = createAlertQueue();
    await queue.add('slack-webhook', request.body as Record<string, unknown>);

    return reply.code(202).send({
      queued: true
    });
  });
};
