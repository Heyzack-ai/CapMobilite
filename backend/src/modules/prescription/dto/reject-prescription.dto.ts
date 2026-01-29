import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectPrescriptionDto {
  @ApiProperty({
    description: 'Reason for rejecting the prescription',
    example: 'Prescription is older than 6 months and has expired',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;
}
