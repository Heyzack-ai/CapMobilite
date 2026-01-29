import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReturnFileType } from '@common/enums';

export class CreateClaimReturnDto {
  @ApiProperty({
    description: 'Type of return file from CPAM',
    enum: ReturnFileType,
    example: ReturnFileType.NOEMIE,
  })
  @IsNotEmpty()
  @IsEnum(ReturnFileType)
  returnType: ReturnFileType;

  @ApiProperty({
    description: 'S3 storage key for the raw return file',
    example: 'returns/2024/01/claim-123/noemie.xml',
  })
  @IsNotEmpty()
  @IsString()
  rawFileStorageKey: string;

  @ApiPropertyOptional({
    description: 'Parsed data from the return file',
    example: { status: 'ACCEPTED', amount: 450.0 },
  })
  @IsOptional()
  @IsObject()
  parsedData?: Record<string, any>;

  @ApiProperty({
    description: 'Date and time the return was received',
    example: '2024-01-15T10:30:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  receivedAt: string;
}
