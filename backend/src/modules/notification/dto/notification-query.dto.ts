import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@common/dto';
import { NotificationType } from './create-notification.dto';
import { NotificationChannel, NotificationStatus } from '@common/enums';

/**
 * Query DTO for listing notifications with filters
 */
export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by read status',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Filter by notification type',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    enum: NotificationChannel,
    description: 'Filter by channel',
  })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({
    enum: NotificationStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}

/**
 * Response DTO for a single notification
 */
export class NotificationResponseDto {
  id: string;
  channel: NotificationChannel;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  status: NotificationStatus;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
}

/**
 * Response DTO for unread count
 */
export class UnreadCountResponseDto {
  count: number;
}

/**
 * Response DTO for bulk operations
 */
export class BulkOperationResponseDto {
  success: boolean;
  count: number;
  message: string;
}
