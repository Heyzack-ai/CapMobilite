import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketSeverity } from '@common/enums';

export enum TicketType {
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  ADJUSTMENT = 'ADJUSTMENT',
  EMERGENCY = 'EMERGENCY',
}

export class CreateServiceTicketDto {
  @ApiProperty({
    description: 'Device ID the ticket is for',
    example: 'uuid-device-id',
  })
  @IsUUID()
  deviceId: string;

  @ApiProperty({
    enum: TicketType,
    description: 'Type of service ticket',
    example: TicketType.REPAIR,
  })
  @IsEnum(TicketType)
  ticketType: TicketType;

  @ApiProperty({
    enum: TicketCategory,
    description: 'Category of the issue',
    example: TicketCategory.BATTERY,
  })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty({
    enum: TicketSeverity,
    description: 'Severity/priority of the issue',
    example: TicketSeverity.MEDIUM,
  })
  @IsEnum(TicketSeverity)
  severity: TicketSeverity;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'The battery is not holding charge for more than 2 hours.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    description: 'Whether this is a safety-related issue',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSafetyIssue?: boolean;
}
