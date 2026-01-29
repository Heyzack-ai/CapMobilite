import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketSeverity, TicketStatus } from '@common/enums';
import { TicketType } from './create-service-ticket.dto';

export class UpdateServiceTicketDto {
  @ApiPropertyOptional({
    enum: TicketType,
    description: 'Type of service ticket',
  })
  @IsOptional()
  @IsEnum(TicketType)
  ticketType?: TicketType;

  @ApiPropertyOptional({
    enum: TicketCategory,
    description: 'Category of the issue',
  })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({
    enum: TicketSeverity,
    description: 'Severity/priority of the issue',
  })
  @IsOptional()
  @IsEnum(TicketSeverity)
  severity?: TicketSeverity;

  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Current status of the ticket',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    description: 'Detailed description of the issue',
    minLength: 10,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a safety-related issue',
  })
  @IsOptional()
  @IsBoolean()
  isSafetyIssue?: boolean;

  @ApiPropertyOptional({
    description: 'Notes about how the issue was resolved',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionNotes?: string;
}

export class AssignTicketDto {
  @ApiPropertyOptional({
    description: 'Technician user ID to assign the ticket to',
  })
  @IsUUID()
  technicianId: string;
}
