import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@integrations/redis';
import { S3Service } from '@integrations/s3';
import { QueueService } from '@integrations/queue';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ReadinessStatus extends HealthStatus {
  checks: {
    database: { status: 'up' | 'down'; latencyMs?: number };
    redis: { status: 'up' | 'down'; latencyMs?: number };
    storage: { status: 'up' | 'down'; latencyMs?: number };
    queue: { status: 'up' | 'down'; latencyMs?: number };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime: number;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private s3Service: S3Service,
    private queueService: QueueService,
  ) {
    this.startTime = Date.now();
  }

  async getHealth(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async getReadiness(): Promise<ReadinessStatus> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkStorage(),
      this.checkQueue(),
    ]);

    const [database, redis, storage, queue] = checks;

    const allUp = checks.every((check) => check.status === 'up');
    const anyDown = checks.some((check) => check.status === 'down');

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allUp) {
      status = 'healthy';
    } else if (anyDown && !checks.every((check) => check.status === 'down')) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database,
        redis,
        storage,
        queue,
      },
    };
  }

  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    latencyMs?: number;
  }> {
    const start = Date.now();
    try {
      const isHealthy = await this.prisma.healthCheck();
      const latencyMs = Date.now() - start;

      if (isHealthy) {
        return { status: 'up', latencyMs };
      }
      return { status: 'down' };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return { status: 'down' };
    }
  }

  private async checkRedis(): Promise<{
    status: 'up' | 'down';
    latencyMs?: number;
  }> {
    const start = Date.now();
    try {
      const isHealthy = await this.redis.healthCheck();
      const latencyMs = Date.now() - start;

      if (isHealthy) {
        return { status: 'up', latencyMs };
      }
      return { status: 'down' };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return { status: 'down' };
    }
  }

  private async checkStorage(): Promise<{
    status: 'up' | 'down';
    latencyMs?: number;
  }> {
    const start = Date.now();
    try {
      const isHealthy = await this.s3Service.healthCheck();
      const latencyMs = Date.now() - start;

      if (isHealthy) {
        return { status: 'up', latencyMs };
      }
      return { status: 'down' };
    } catch (error) {
      this.logger.error('S3 health check failed', error);
      return { status: 'down' };
    }
  }

  private async checkQueue(): Promise<{
    status: 'up' | 'down';
    latencyMs?: number;
  }> {
    const start = Date.now();
    try {
      const isHealthy = await this.queueService.healthCheck();
      const latencyMs = Date.now() - start;

      if (isHealthy) {
        return { status: 'up', latencyMs };
      }
      return { status: 'down' };
    } catch (error) {
      this.logger.error('Queue health check failed', error);
      return { status: 'down' };
    }
  }
}
