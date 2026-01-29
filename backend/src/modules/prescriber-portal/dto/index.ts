import { IsUUID, IsOptional, IsString, IsNotEmpty, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@common/enums';

/**
 * Generate prescriber link request
 */
export class GeneratePrescriberLinkDto {
  @ApiProperty({ description: 'Patient profile ID to generate link for' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ description: 'Prescriber email for notification' })
  @IsOptional()
  @IsString()
  prescriberEmail?: string;

  @ApiPropertyOptional({ description: 'Prescriber name for display' })
  @IsOptional()
  @IsString()
  prescriberName?: string;

  @ApiPropertyOptional({ description: 'Custom expiration hours (default: 168 = 7 days)' })
  @IsOptional()
  expiresInHours?: number;
}

/**
 * Prescription submission via link
 */
export class SubmitPrescriptionDto {
  @ApiProperty({ description: 'Uploaded prescription document ID' })
  @IsUUID()
  prescriptionDocumentId: string;

  @ApiPropertyOptional({ description: 'Additional supporting document IDs' })
  @IsOptional()
  @IsUUID('4', { each: true })
  supportingDocumentIds?: string[];

  @ApiProperty({ description: 'Product category prescribed', enum: ProductCategory })
  @IsEnum(ProductCategory)
  productCategory: ProductCategory;

  @ApiPropertyOptional({ description: 'Prescriber notes about the prescription' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Prescriber license number' })
  @IsOptional()
  @IsString()
  prescriberLicenseNumber?: string;
}

/**
 * Prescriber link response
 */
export class PrescriberLinkResponseDto {
  @ApiProperty({ description: 'Generated link URL' })
  linkUrl: string;

  @ApiProperty({ description: 'Link token for tracking' })
  token: string;

  @ApiProperty({ description: 'Link expiration time' })
  expiresAt: Date;

  @ApiProperty({ description: 'Patient reference (masked)' })
  patientReference: string;
}

/**
 * Link validation response
 */
export class ValidateLinkResponseDto {
  @ApiProperty({ description: 'Whether the link is valid' })
  valid: boolean;

  @ApiPropertyOptional({ description: 'Reason if invalid' })
  reason?: string;

  @ApiPropertyOptional({ description: 'Patient first name (masked)' })
  patientFirstName?: string;

  @ApiPropertyOptional({ description: 'Patient last initial' })
  patientLastInitial?: string;

  @ApiPropertyOptional({ description: 'Link expiration time' })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Whether link has already been used' })
  alreadyUsed?: boolean;
}

/**
 * Prescription submission response
 */
export class SubmitPrescriptionResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Created prescription ID' })
  prescriptionId: string;

  @ApiProperty({ description: 'Submission reference number' })
  referenceNumber: string;
}
