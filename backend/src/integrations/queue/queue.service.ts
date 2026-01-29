import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';

export interface QueueJobData {
  [key: string]: any;
}

export type JobProcessor<T> = (job: Job<T>) => Promise<any>;

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues: Map<string, Queue> = new Map();
  private readonly workers: Map<string, Worker> = new Map();
  private readonly events: Map<string, QueueEvents> = new Map();
  private readonly redisConnection: { host: string; port: number };

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url') || 'redis://localhost:6379';
    const url = new URL(redisUrl);
    this.redisConnection = {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
    };
  }

  async onModuleDestroy() {
    this.logger.log('Closing all queues and workers...');

    // Close all workers first
    for (const [name, worker] of this.workers) {
      await worker.close();
      this.logger.debug(`Closed worker: ${name}`);
    }

    // Close all queue events
    for (const [name, events] of this.events) {
      await events.close();
      this.logger.debug(`Closed queue events: ${name}`);
    }

    // Close all queues
    for (const [name, queue] of this.queues) {
      await queue.close();
      this.logger.debug(`Closed queue: ${name}`);
    }

    this.logger.log('All queues and workers closed');
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.redisConnection,
      });
      this.queues.set(name, queue);
      this.logger.debug(`Created queue: ${name}`);
    }
    return this.queues.get(name)!;
  }

  async addJob<T extends QueueJobData>(
    queueName: string,
    jobName: string,
    data: T,
    options?: {
      delay?: number;
      attempts?: number;
      backoff?: { type: 'exponential' | 'fixed'; delay: number };
      priority?: number;
    },
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);

    const job = await queue.add(jobName, data, {
      delay: options?.delay,
      attempts: options?.attempts || 3,
      backoff: options?.backoff || { type: 'exponential', delay: 1000 },
      priority: options?.priority,
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.debug(
      `Added job ${job.id} (${jobName}) to queue ${queueName}`,
    );

    return job;
  }

  registerWorker<T extends QueueJobData>(
    queueName: string,
    processor: JobProcessor<T>,
    options?: { concurrency?: number },
  ): Worker {
    if (this.workers.has(queueName)) {
      this.logger.warn(`Worker for queue ${queueName} already exists`);
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(
      queueName,
      async (job: Job<T>) => {
        this.logger.debug(
          `Processing job ${job.id} (${job.name}) from queue ${queueName}`,
        );
        try {
          const result = await processor(job);
          this.logger.debug(
            `Completed job ${job.id} (${job.name}) from queue ${queueName}`,
          );
          return result;
        } catch (error) {
          this.logger.error(
            `Failed job ${job.id} (${job.name}) from queue ${queueName}: ${error.message}`,
          );
          throw error;
        }
      },
      {
        connection: this.redisConnection,
        concurrency: options?.concurrency || 5,
      },
    );

    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    worker.on('error', (err) => {
      this.logger.error(`Worker error: ${err.message}`);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Registered worker for queue: ${queueName}`);

    return worker;
  }

  async getJobCounts(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(queueName);
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    return {
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Try to get a queue and check its status
      const testQueue = this.getQueue('health-check');
      await testQueue.getJobCounts('waiting');
      return true;
    } catch (error) {
      this.logger.error('Queue health check failed', error);
      return false;
    }
  }
}

// Queue names constants
export const QUEUE_NAMES = {
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  BILLING: 'billing',
  MAINTENANCE: 'maintenance',
  AUDIT: 'audit',
} as const;
