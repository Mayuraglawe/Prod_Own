export const IngestSchema = {
  body: {
    type: 'object',
    required: ['tenantId', 'sourceId', 'content'],
    properties: {
      tenantId: { type: 'string', minLength: 1 },
      sourceId: { type: 'string', minLength: 1 },
      content: { type: 'string', minLength: 1 },
      metadata: { 
        type: 'object',
        additionalProperties: true
      }
    }
  }
};
