import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

import { configValidationSchema } from '@config/validation.schema';
import configuration from '@config/configuration';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { DocumentModule } from '@modules/document/document.module';
import { AuditModule } from '@modules/audit/audit.module';
import { HealthModule } from '@modules/health/health.module';
import { ProductModule } from '@modules/product/product.module';
import { QuoteModule } from '@modules/quote/quote.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { DeviceModule } from '@modules/device/device.module';
import { ServiceTicketModule } from '@modules/service-ticket/service-ticket.module';
import { PrescriptionModule } from '@modules/prescription/prescription.module';
import { CaseModule } from '@modules/case/case.module';
import { ClaimModule } from '@modules/claim/claim.module';
import { ConsentModule } from '@modules/consent/consent.module';
import { ProxyModule } from '@modules/proxy/proxy.module';
import { PrescriberPortalModule } from '@modules/prescriber-portal/prescriber-portal.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AdminModule } from '@modules/admin/admin.module';
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

    // Scheduling for cron jobs
    ScheduleModule.forRoot(),

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
    ProductModule,
    QuoteModule,
    NotificationModule,
    DeviceModule,
    ServiceTicketModule,
    PrescriptionModule,
    CaseModule,
    ClaimModule,
    ConsentModule,
    ProxyModule,
    PrescriberPortalModule,
    ChatModule,
    AdminModule,
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
