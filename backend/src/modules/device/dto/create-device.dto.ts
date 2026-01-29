import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'Device serial number',
    example: 'SN-2024-001234',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  serialNumber: string;

  @ApiProperty({
    description: 'Product ID for the device model',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    description: 'Warranty end date',
    example: '2027-01-15',
  })
  @IsOptional()
  @IsDateString()
  warrantyEndDate?: string;

  @ApiPropertyOptional({
    description: 'Current location of the device (JSON object)',
    example: { warehouse: 'Paris-Central', shelf: 'A-12' },
  })
  @IsOptional()
  currentLocation?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional notes about the device',
    example: 'Brand new, unopened packaging',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
