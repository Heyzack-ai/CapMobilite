import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { DatabaseModule } from '@/database';
import { QueueModule } from '@integrations/queue';

@Module({
  imports: [DatabaseModule, QueueModule],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
