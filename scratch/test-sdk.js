const { init } = require('../packages/sdk-node/dist/index.js');

init({
  endpoint: 'http://localhost:3000',
  tenantId: 'test-tenant-123',
  sourceId: 'node-test-script'
});

console.log('SDK initialized. Throwing error now...');

// Throw an intentional error to trigger the uncaughtException handler
setTimeout(() => {
  throw new Error('This is a test error from the newly built SDK!');
}, 500);
