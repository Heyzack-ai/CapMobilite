import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceInstanceStatus } from '@common/enums';

export class UpdateDeviceDto {
  @ApiPropertyOptional({
    description: 'Device status',
    enum: DeviceInstanceStatus,
    example: DeviceInstanceStatus.IN_MAINTENANCE,
  })
  @IsOptional()
  @IsEnum(DeviceInstanceStatus)
  status?: DeviceInstanceStatus;

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
    example: 'Returned for maintenance check',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
