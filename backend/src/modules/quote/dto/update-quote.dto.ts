import { IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuoteDto {
  @ApiPropertyOptional({
    description: 'Internal notes for the quote',
    example: 'Updated specifications per patient request',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Custom validity period in days',
    example: 45,
    minimum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(7)
  validityDays?: number;
}

export class RejectQuoteDto {
  @ApiPropertyOptional({
    description: 'Reason for rejection',
    example: 'Price too high, requesting alternative options',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
