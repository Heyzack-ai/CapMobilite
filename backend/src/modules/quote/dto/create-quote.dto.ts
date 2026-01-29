import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({
    description: 'Case ID to create quote for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  caseId: string;

  @ApiPropertyOptional({
    description: 'Internal notes for the quote',
    example: 'Patient requires custom armrests',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Custom validity period in days (default 30)',
    example: 30,
    minimum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(7)
  validityDays?: number;
}
