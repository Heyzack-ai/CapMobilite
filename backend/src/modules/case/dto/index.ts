export { CreateCaseDto } from './create-case.dto';
export { UpdateCaseDto } from './update-case.dto';
export { CreateCaseNoteDto } from './create-case-note.dto';
export { CreateCaseTaskDto } from './create-case-task.dto';
export { UpdateCaseTaskDto } from './update-case-task.dto';

import { IsUUID, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@common/enums';

export class AttachCaseDocumentDto {
  @ApiProperty({
    example: 'uuid-of-document',
    description: 'ID of the document to attach',
  })
  @IsUUID()
  documentId: string;

  @ApiPropertyOptional({
    enum: DocumentType,
    description: 'Override the document type for this attachment',
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    example: 'Patient ID verification',
    description: 'Additional notes about this document',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CaseDocumentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  documentId: string;

  @ApiProperty({ example: 'ordonnance.pdf' })
  filename: string;

  @ApiProperty({ enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 245678 })
  sizeBytes: number;

  @ApiProperty({ example: 'CLEAN' })
  scanStatus: string;

  @ApiProperty({ example: '2025-01-29T10:00:00Z' })
  addedAt: Date;
}

export class CaseDocumentsListResponseDto {
  @ApiProperty({ type: [CaseDocumentResponseDto] })
  data: CaseDocumentResponseDto[];

  @ApiProperty({ example: 5 })
  total: number;
}
