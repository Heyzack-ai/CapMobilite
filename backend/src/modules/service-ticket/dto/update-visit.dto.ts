import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VisitOutcome } from '@common/enums';

export class UpdateVisitDto {
  @ApiPropertyOptional({
    description: 'Reschedule date and time for the visit',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Actual arrival time',
  })
  @IsOptional()
  @IsDateString()
  arrivedAt?: string;

  @ApiPropertyOptional({
    description: 'Completion time',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({
    enum: VisitOutcome,
    description: 'Outcome of the visit',
  })
  @IsOptional()
  @IsEnum(VisitOutcome)
  outcome?: VisitOutcome;

  @ApiPropertyOptional({
    description: 'Notes about the visit',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Document ID for signature image',
  })
  @IsOptional()
  @IsUUID()
  signatureImageId?: string;
}
