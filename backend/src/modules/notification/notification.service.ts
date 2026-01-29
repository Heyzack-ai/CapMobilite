import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { QueueService, QUEUE_NAMES } from '@integrations/queue';
import { NotificationChannel, NotificationStatus, UserRole } from '@common/enums';
import {
  CreateNotificationDto,
  NotificationType,
  NotificationQueryDto,
  NotificationResponseDto,
} from './dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  /**
   * Create a notification and optionally queue for delivery
   */
  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    // Build the template ID based on type if not provided
    const templateId = dto.templateId || `notification.${dto.type.toLowerCase()}`;

    // Build context with title and message
    const context = {
      title: dto.title,
      message: dto.message,
      type: dto.type,
      relatedEntityId: dto.relatedEntityId,
      relatedEntityType: dto.relatedEntityType,
      ...(dto.context || {}),
    };

    const notification = await this.prisma.notification.create({
      data: {
        recipientId: dto.recipientId,
        channel: dto.channel,
        templateId,
        context,
        status: NotificationStatus.PENDING,
      },
    });

    // Queue the notification for delivery
    await this.queueService.addJob(
      QUEUE_NAMES.NOTIFICATIONS,
      'send-notification',
      {
        notificationId: notification.id,
        channel: dto.channel,
        recipientId: dto.recipientId,
        templateId,
        context,
      },
      { attempts: 3 },
    );

    this.logger.log(
      `Notification ${notification.id} created and queued for ${dto.channel}`,
    );

    return this.mapToResponse(notification);
  }

  /**
   * Create multiple notifications (e.g., for broadcast)
   */
  async createBulk(
    notifications: CreateNotificationDto[],
  ): Promise<{ created: number; queued: number }> {
    let created = 0;
    let queued = 0;

    for (const dto of notifications) {
      try {
        await this.create(dto);
        created++;
        queued++;
      } catch (error) {
        this.logger.error(
          `Failed to create notification for ${dto.recipientId}: ${error.message}`,
        );
      }
    }

    return { created, queued };
  }

  /**
   * Get paginated list of notifications for a user
   */
  async findAll(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<{
    data: NotificationResponseDto[];
    pagination: { cursor?: string; hasMore: boolean; limit: number };
  }> {
    const where: any = {
      recipientId: userId,
    };

    // Filter by read status
    if (query.isRead !== undefined) {
      if (query.isRead) {
        where.context = {
          path: ['isRead'],
          equals: true,
        };
      } else {
        where.OR = [
          { context: { path: ['isRead'], equals: false } },
          { NOT: { context: { path: ['isRead'] } } },
        ];
      }
    }

    // Filter by type
    if (query.type) {
      where.context = {
        ...(where.context || {}),
        path: ['type'],
        equals: query.type,
      };
    }

    // Filter by channel
    if (query.channel) {
      where.channel = query.channel;
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    const limit = query.limit || 20;

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
    });

    const hasMore = notifications.length > limit;
    const data = hasMore ? notifications.slice(0, -1) : notifications;

    return {
      data: data.map((n) => this.mapToResponse(n)),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Get single notification by ID
   */
  async findOne(
    notificationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Check access
    if (!this.canAccess(notification, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return this.mapToResponse(notification);
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Count notifications where isRead is false or not set in context
    const allNotifications = await this.prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      select: {
        id: true,
        context: true,
      },
    });

    const unreadCount = allNotifications.filter((n) => {
      const context = n.context as any;
      return !context?.isRead;
    }).length;

    return unreadCount;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!this.canAccess(notification, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    const existingContext = (notification.context as any) || {};

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        context: {
          ...existingContext,
          isRead: true,
          readAt: new Date().toISOString(),
        },
      },
    });

    this.logger.debug(`Notification ${notificationId} marked as read`);

    return this.mapToResponse(updated);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    // Get all unread notifications
    const unreadNotifications = await this.prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
    });

    let count = 0;
    const now = new Date().toISOString();

    for (const notification of unreadNotifications) {
      const context = (notification.context as any) || {};
      if (!context.isRead) {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            context: {
              ...context,
              isRead: true,
              readAt: now,
            },
          },
        });
        count++;
      }
    }

    this.logger.log(`Marked ${count} notifications as read for user ${userId}`);

    return { count };
  }

  /**
   * Delete a notification
   */
  async delete(
    notificationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!this.canAccess(notification, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    this.logger.debug(`Notification ${notificationId} deleted`);
  }

  /**
   * Update notification status after delivery attempt
   */
  async updateStatus(
    notificationId: string,
    status: NotificationStatus,
    metadata?: { externalId?: string; failureReason?: string },
  ): Promise<void> {
    const updateData: any = {
      status,
    };

    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    }

    if (status === NotificationStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    if (metadata?.externalId) {
      updateData.externalId = metadata.externalId;
    }

    if (metadata?.failureReason) {
      updateData.failureReason = metadata.failureReason;
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
    });

    this.logger.debug(
      `Notification ${notificationId} status updated to ${status}`,
    );
  }

  /**
   * Create case update notification
   */
  async notifyCaseUpdate(
    recipientId: string,
    caseNumber: string,
    caseId: string,
    statusMessage: string,
    channel: NotificationChannel = NotificationChannel.EMAIL,
  ): Promise<NotificationResponseDto> {
    return this.create({
      recipientId,
      channel,
      type: NotificationType.CASE_UPDATE,
      title: `Case ${caseNumber} Updated`,
      message: statusMessage,
      relatedEntityId: caseId,
      relatedEntityType: 'Case',
      context: { caseNumber },
    });
  }

  /**
   * Create quote ready notification
   */
  async notifyQuoteReady(
    recipientId: string,
    quoteNumber: string,
    quoteId: string,
    amount: number,
    channel: NotificationChannel = NotificationChannel.EMAIL,
  ): Promise<NotificationResponseDto> {
    return this.create({
      recipientId,
      channel,
      type: NotificationType.QUOTE_READY,
      title: 'Your Quote is Ready',
      message: `Quote ${quoteNumber} is ready for your review. Total amount: ${amount.toFixed(2)} EUR`,
      relatedEntityId: quoteId,
      relatedEntityType: 'Quote',
      context: { quoteNumber, amount },
    });
  }

  /**
   * Create claim status notification
   */
  async notifyClaimStatus(
    recipientId: string,
    claimNumber: string,
    claimId: string,
    status: string,
    channel: NotificationChannel = NotificationChannel.EMAIL,
  ): Promise<NotificationResponseDto> {
    return this.create({
      recipientId,
      channel,
      type: NotificationType.CLAIM_STATUS,
      title: `Claim ${claimNumber} Status Update`,
      message: `Your claim status has been updated to: ${status}`,
      relatedEntityId: claimId,
      relatedEntityType: 'Claim',
      context: { claimNumber, status },
    });
  }

  /**
   * Create appointment reminder notification
   */
  async notifyAppointmentReminder(
    recipientId: string,
    appointmentDate: Date,
    appointmentId: string,
    description: string,
    channel: NotificationChannel = NotificationChannel.SMS,
  ): Promise<NotificationResponseDto> {
    const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return this.create({
      recipientId,
      channel,
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Appointment Reminder',
      message: `Reminder: ${description} on ${formattedDate}`,
      relatedEntityId: appointmentId,
      relatedEntityType: 'TechnicianVisit',
      context: { appointmentDate: appointmentDate.toISOString(), description },
    });
  }

  /**
   * Create document required notification
   */
  async notifyDocumentRequired(
    recipientId: string,
    documentType: string,
    caseId: string,
    channel: NotificationChannel = NotificationChannel.EMAIL,
  ): Promise<NotificationResponseDto> {
    return this.create({
      recipientId,
      channel,
      type: NotificationType.DOCUMENT_REQUIRED,
      title: 'Document Required',
      message: `Please upload the following document: ${documentType}`,
      relatedEntityId: caseId,
      relatedEntityType: 'Case',
      context: { documentType },
    });
  }

  /**
   * Create system alert notification
   */
  async notifySystemAlert(
    recipientId: string,
    alertTitle: string,
    alertMessage: string,
    severity: 'info' | 'warning' | 'error' = 'info',
    channel: NotificationChannel = NotificationChannel.EMAIL,
  ): Promise<NotificationResponseDto> {
    return this.create({
      recipientId,
      channel,
      type: NotificationType.SYSTEM_ALERT,
      title: alertTitle,
      message: alertMessage,
      context: { severity },
    });
  }

  /**
   * Check if user can access the notification
   */
  private canAccess(
    notification: any,
    userId: string,
    userRole: UserRole,
  ): boolean {
    // Recipients can access their own notifications
    if (notification.recipientId === userId) {
      return true;
    }

    // Admins and compliance can access all notifications
    if ([UserRole.COMPLIANCE_ADMIN, UserRole.OPS].includes(userRole)) {
      return true;
    }

    return false;
  }

  /**
   * Map Prisma notification to response DTO
   */
  private mapToResponse(notification: any): NotificationResponseDto {
    const context = (notification.context as any) || {};

    return {
      id: notification.id,
      channel: notification.channel,
      type: context.type || 'SYSTEM_ALERT',
      title: context.title || '',
      message: context.message || '',
      isRead: context.isRead || false,
      readAt: context.readAt ? new Date(context.readAt) : undefined,
      status: notification.status,
      relatedEntityId: context.relatedEntityId,
      relatedEntityType: context.relatedEntityType,
      createdAt: notification.createdAt,
    };
  }
}
