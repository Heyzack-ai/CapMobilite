import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel } from '@common/enums';

/**
 * Notification types for the wheelchair platform
 */
export enum NotificationType {
  CASE_UPDATE = 'CASE_UPDATE',
  QUOTE_READY = 'QUOTE_READY',
  CLAIM_STATUS = 'CLAIM_STATUS',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  DOCUMENT_REQUIRED = 'DOCUMENT_REQUIRED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

/**
 * DTO for creating a notification (internal use)
 */
export class CreateNotificationDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsUUID()
  recipientId: string;

  @ApiProperty({ enum: NotificationChannel, description: 'Notification channel' })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Template ID for rendering' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Additional context data' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Related entity ID (case, quote, etc.)' })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional({ description: 'Related entity type' })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;
}

/**
 * DTO for creating multiple notifications at once
 */
export class CreateBulkNotificationsDto {
  @ApiProperty({ type: [CreateNotificationDto] })
  notifications: CreateNotificationDto[];
}
