import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Notification preferences response (matches schema)
 */
export class NotificationPreferencesDto {
  @ApiProperty({ description: 'Enable email notifications globally' })
  emailEnabled: boolean;

  @ApiProperty({ description: 'Enable SMS notifications globally' })
  smsEnabled: boolean;

  @ApiProperty({ description: 'Receive case status updates' })
  caseUpdates: boolean;

  @ApiProperty({ description: 'Receive quote notifications' })
  quoteNotifications: boolean;

  @ApiProperty({ description: 'Receive delivery alerts' })
  deliveryAlerts: boolean;

  @ApiProperty({ description: 'Receive maintenance reminders' })
  maintenanceReminders: boolean;

  @ApiProperty({ description: 'Receive marketing emails' })
  marketingEmails: boolean;
}

/**
 * Update notification preferences request
 */
export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Enable email notifications globally' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications globally' })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Receive case status updates' })
  @IsOptional()
  @IsBoolean()
  caseUpdates?: boolean;

  @ApiPropertyOptional({ description: 'Receive quote notifications' })
  @IsOptional()
  @IsBoolean()
  quoteNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Receive delivery alerts' })
  @IsOptional()
  @IsBoolean()
  deliveryAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Receive maintenance reminders' })
  @IsOptional()
  @IsBoolean()
  maintenanceReminders?: boolean;

  @ApiPropertyOptional({ description: 'Receive marketing emails' })
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
