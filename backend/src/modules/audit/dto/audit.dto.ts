import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActorType } from '@common/enums';

export class AuditQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  objectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: string;
}

export class AuditEventDto {
  actorId?: string;
  actorType: ActorType;
  action: string;
  objectType: string;
  objectId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}
