// worker/index.ts
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../lib/prisma';

// Upstash-friendly Redis Connection
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    console.warn(`⚠️ Redis disconnected. Retrying in ${delay}ms... (Attempt ${times})`);
    return delay;
  },
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
});

connection.on('connect', () => console.log('✅ Worker connected to Redis'));
connection.on('error', (err) => console.error('❌ Redis Connection Error:', err.message));

const worker = new Worker(
  'automationQueue',
  async (job: Job) => {
    console.log(`⚙️ [${new Date().toISOString()}] Processing Automation Job: ${job.id}`);
    const { automationId } = job.data;

    const automation = await prisma.automation.findUnique({
      where: { id: automationId },
      include: { form: true },
    });

    if (!automation || !automation.isActive) {
      console.log(`⏩ Skipping inactive or deleted automation ID: ${automationId}`);
      return;
    }

    // --- YOUR AUTOMATION EXECUTION LOGIC HERE ---
    console.log(`🚀 Successfully executed form automation for: ${automation.name}`);
    
    await prisma.automation.update({
      where: { id: automationId },
      data: { status: 'COMPLETED' },
    });
  },
  {
    connection,
    concurrency: 5,
    lockDuration: 30000,
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err.message);
});

console.log('🤖 Background Worker running... Waiting for scheduled jobs!');
worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err.message);
  
  if (job && job.attemptsMade < (job.opts.attempts || 1)) {
    console.log(`⏳ Retrying job ${job.id}... (Attempt ${job.attemptsMade + 1} of ${job.opts.attempts})`);
  }
});