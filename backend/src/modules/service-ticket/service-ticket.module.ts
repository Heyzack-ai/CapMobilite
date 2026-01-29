import { Module } from '@nestjs/common';
import { ServiceTicketController } from './service-ticket.controller';
import { ServiceTicketService } from './service-ticket.service';

@Module({
  controllers: [ServiceTicketController],
  providers: [ServiceTicketService],
  exports: [ServiceTicketService],
})
export class ServiceTicketModule {}
