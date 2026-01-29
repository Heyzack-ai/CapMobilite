import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '@common/enums';

export class CreateCaseTaskDto {
  @ApiProperty({
    description: 'Type of task',
    enum: TaskType,
  })
  @IsEnum(TaskType)
  taskType: TaskType;

  @ApiProperty({
    description: 'Task title',
    example: 'Request ID card copy from patient',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed task description',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this task',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2025-02-10T17:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
