import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@common/enums';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({
    description: 'Updated prescription date',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  prescriptionDate?: string;

  @ApiPropertyOptional({
    description: 'Updated product category',
    enum: ProductCategory,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  productCategory?: ProductCategory;

  @ApiPropertyOptional({
    description: 'Updated clinical notes',
    example: 'Updated diagnosis notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  clinicalNotes?: string;

  @ApiPropertyOptional({
    description: 'Prescriber RPPS number (11 digits)',
    example: '12345678901',
  })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  prescriberRppsNumber?: string;

  @ApiPropertyOptional({
    description: 'Prescriber ADELI number (9 digits)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  prescriberAdeliNumber?: string;

  @ApiPropertyOptional({
    description: 'Prescriber name',
    example: 'Dr. Jean Dupont',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  prescriberName?: string;
}
