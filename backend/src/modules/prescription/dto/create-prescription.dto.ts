import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@common/enums';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'ID of the uploaded prescription document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  documentId: string;

  @ApiPropertyOptional({
    description: 'ID of the patient (required for prescribers, auto-filled for patients)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiProperty({
    description: 'Date the prescription was issued',
    example: '2024-01-15',
  })
  @IsDateString()
  prescriptionDate: string;

  @ApiProperty({
    description: 'Product category prescribed',
    enum: ProductCategory,
  })
  @IsEnum(ProductCategory)
  productCategory: ProductCategory;

  @ApiPropertyOptional({
    description: 'Clinical notes or diagnosis',
    example: 'Patient requires electric wheelchair due to limited upper body mobility',
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
