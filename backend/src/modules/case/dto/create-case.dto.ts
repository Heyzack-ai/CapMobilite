import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CasePriority } from '@common/enums';

export class CreateCaseDto {
  @ApiProperty({
    description: 'ID of the prescription associated with this case',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  prescriptionId: string;

  @ApiPropertyOptional({
    description: 'Case priority level',
    enum: CasePriority,
    default: CasePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiPropertyOptional({
    description: 'Initial notes for the case',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
