import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CaseStatus, CasePriority } from '@common/enums';

export class UpdateCaseDto {
  @ApiPropertyOptional({
    description: 'Case status',
    enum: CaseStatus,
  })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({
    description: 'Case priority level',
    enum: CasePriority,
  })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this case',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'SLA deadline for the case',
    example: '2025-02-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  slaDeadline?: string;

  @ApiPropertyOptional({
    description: 'Rejection reason (required when status is CPAM_REJECTED)',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason?: string;
}
