import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLpprItemDto {
  @ApiProperty({
    description: 'LPPR code (French reimbursement nomenclature)',
    example: '1234567',
  })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Label describing the LPPR item' })
  @IsString()
  @MaxLength(500)
  label: string;

  @ApiProperty({ description: 'Category of the LPPR item', example: 'Fauteuils roulants manuels' })
  @IsString()
  @MaxLength(200)
  category: string;

  @ApiPropertyOptional({ description: 'Maximum reimbursable price in euros' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Annual maintenance forfait in euros' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maintenanceForfait?: number;

  @ApiProperty({ description: 'Valid from date (YYYY-MM-DD)', example: '2024-01-01' })
  @IsDateString()
  validFrom: string;

  @ApiPropertyOptional({ description: 'Valid until date (YYYY-MM-DD)', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
