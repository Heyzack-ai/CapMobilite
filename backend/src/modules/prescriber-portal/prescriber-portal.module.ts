import { Module } from '@nestjs/common';
import { PrescriberPortalController } from './prescriber-portal.controller';
import { PrescriberPortalService } from './prescriber-portal.service';
import { DatabaseModule } from '@/database';

@Module({
  imports: [DatabaseModule],
  controllers: [PrescriberPortalController],
  providers: [PrescriberPortalService],
  exports: [PrescriberPortalService],
})
export class PrescriberPortalModule {}
