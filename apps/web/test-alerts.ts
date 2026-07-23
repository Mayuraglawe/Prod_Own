import { enqueueAlert } from '@prod-own/queue';

async function main() {
  console.log('Enqueueing mock alert...');
  
  // NOTE: You'll need to have an issue in the DB with ID 'mock-issue-id' 
  // and an AlertConfig for its source, or the worker will skip it.
  // We're just testing the queue and worker instantiation here.
  await enqueueAlert('mock-issue-id', 'new_issue');
  
  console.log('Alert enqueued successfully!');
  process.exit(0);
}

main().catch(console.error);
