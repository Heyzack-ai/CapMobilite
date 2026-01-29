import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { configValidationSchema } from '@config/validation.schema';
import configuration from '@config/configuration';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { DocumentModule } from '@modules/document/document.module';
import { AuditModule } from '@modules/audit/audit.module';
import { HealthModule } from '@modules/health/health.module';
import { S3Module } from '@integrations/s3/s3.module';
import { RedisModule } from '@integrations/redis/redis.module';
import { QueueModule } from '@integrations/queue/queue.module';

import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Core modules
    DatabaseModule,
    S3Module,
    RedisModule,
    QueueModule,

    // Feature modules
    AuthModule,
    UserModule,
    DocumentModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    // Global JWT guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
