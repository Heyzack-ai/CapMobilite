import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPrescriptionDto {
  @ApiPropertyOptional({
    description: 'Optional verification notes',
    example: 'Prescriber credentials verified against RPPS database',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  verificationNotes?: string;
}
