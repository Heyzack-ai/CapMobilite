import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController, UserDocumentController } from './document.controller';

@Module({
  controllers: [DocumentController, UserDocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
