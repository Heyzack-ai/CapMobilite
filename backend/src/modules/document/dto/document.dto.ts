import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@common/enums';

export class PresignUploadDto {
  @ApiProperty({ example: 'prescription.pdf' })
  @IsString()
  @MaxLength(255)
  filename: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ example: 245678, description: 'File size in bytes (max 50MB)' })
  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024) // 50MB
  sizeBytes: number;
}

export class PresignUploadResponseDto {
  @ApiProperty({ description: 'Pre-signed URL for direct upload' })
  uploadUrl: string;

  @ApiProperty({ description: 'Storage key to use for completion' })
  storageKey: string;

  @ApiProperty({ description: 'URL expiration time in seconds' })
  expiresIn: number;
}

export class CompleteUploadDto {
  @ApiProperty({ description: 'Storage key from presign response' })
  @IsString()
  storageKey: string;

  @ApiProperty({ description: 'SHA-256 hash of uploaded file' })
  @IsString()
  sha256Hash: string;

  @ApiPropertyOptional({ description: 'Optional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  sizeBytes: number;

  @ApiProperty({ enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty()
  scanStatus: string;

  @ApiProperty()
  createdAt: Date;
}
