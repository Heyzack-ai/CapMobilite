import { IsUUID, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignDeviceDto {
  @ApiProperty({
    description: 'Patient profile ID to assign the device to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Case ID associated with this device assignment',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiPropertyOptional({
    description: 'Delivery date (defaults to current date)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;
}
