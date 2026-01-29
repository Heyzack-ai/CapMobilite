import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueService, QUEUE_NAMES } from '@integrations/queue';
import { PrismaService } from '@/database/prisma.service';
import { NotificationChannel, NotificationStatus } from '@common/enums';

/**
 * Job data interface for notification processing
 */
interface NotificationJobData {
  notificationId: string;
  channel: NotificationChannel;
  recipientId: string;
  templateId: string;
  context: Record<string, any>;
}

/**
 * Processor for handling notification queue jobs
 * Registers workers for sending email and SMS notifications
 */
@Injectable()
export class NotificationProcessor implements OnModuleInit {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private queueService: QueueService,
    private prisma: PrismaService,
  ) {}

  /**
   * Register the notification worker on module init
   */
  onModuleInit() {
    this.registerWorker();
  }

  /**
   * Register the BullMQ worker for processing notification jobs
   */
  private registerWorker() {
    this.queueService.registerWorker<NotificationJobData>(
      QUEUE_NAMES.NOTIFICATIONS,
      async (job: Job<NotificationJobData>) => {
        return this.processNotification(job);
      },
      { concurrency: 10 },
    );

    this.logger.log('Notification processor worker registered');
  }

  /**
   * Process a notification job - route to appropriate channel handler
   */
  private async processNotification(
    job: Job<NotificationJobData>,
  ): Promise<void> {
    const { notificationId, channel, recipientId, templateId, context } =
      job.data;

    this.logger.debug(
      `Processing notification ${notificationId} via ${channel}`,
    );

    try {
      // Get recipient details
      const recipient = await this.prisma.user.findUnique({
        where: { id: recipientId },
        select: { email: true, phone: true },
      });

      if (!recipient) {
        throw new Error(`Recipient ${recipientId} not found`);
      }

      let result: { externalId?: string };

      switch (channel) {
        case NotificationChannel.EMAIL:
          result = await this.sendEmailNotification(
            recipient.email,
            templateId,
            context,
          );
          break;

        case NotificationChannel.SMS:
          if (!recipient.phone) {
            throw new Error('Recipient has no phone number for SMS');
          }
          result = await this.sendSmsNotification(
            recipient.phone,
            templateId,
            context,
          );
          break;

        default:
          throw new Error(`Unknown notification channel: ${channel}`);
      }

      // Update notification status to sent
      await this.updateNotificationStatus(notificationId, NotificationStatus.SENT, {
        externalId: result.externalId,
      });

      this.logger.log(
        `Notification ${notificationId} sent successfully via ${channel}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notificationId}: ${error.message}`,
      );

      // Update notification status to failed
      await this.updateNotificationStatus(
        notificationId,
        NotificationStatus.FAILED,
        { failureReason: error.message },
      );

      throw error; // Re-throw to trigger retry mechanism
    }
  }

  /**
   * Send email notification (placeholder implementation)
   * TODO: Integrate with actual email service (SendGrid, SES, etc.)
   */
  private async sendEmailNotification(
    email: string,
    templateId: string,
    context: Record<string, any>,
  ): Promise<{ externalId?: string }> {
    // Placeholder implementation - log the email details
    this.logger.log('=== EMAIL NOTIFICATION ===');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Template: ${templateId}`);
    this.logger.log(`Subject: ${context.title || 'Notification'}`);
    this.logger.log(`Body: ${context.message || 'No message'}`);
    this.logger.log('=========================');

    // Simulate email sending delay
    await this.simulateDelay(100);

    // TODO: Replace with actual email service integration
    // Example with SendGrid:
    // const response = await sendgrid.send({
    //   to: email,
    //   from: 'notifications@capmobilite.fr',
    //   templateId: templateId,
    //   dynamicTemplateData: context,
    // });
    // return { externalId: response[0].headers['x-message-id'] };

    return { externalId: `email-${Date.now()}` };
  }

  /**
   * Send SMS notification (placeholder implementation)
   * TODO: Integrate with actual SMS service (Twilio, etc.)
   */
  private async sendSmsNotification(
    phone: string,
    templateId: string,
    context: Record<string, any>,
  ): Promise<{ externalId?: string }> {
    // Placeholder implementation - log the SMS details
    this.logger.log('=== SMS NOTIFICATION ===');
    this.logger.log(`To: ${phone}`);
    this.logger.log(`Template: ${templateId}`);
    this.logger.log(`Message: ${context.message || 'No message'}`);
    this.logger.log('========================');

    // Simulate SMS sending delay
    await this.simulateDelay(100);

    // TODO: Replace with actual SMS service integration
    // Example with Twilio:
    // const message = await twilioClient.messages.create({
    //   body: context.message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });
    // return { externalId: message.sid };

    return { externalId: `sms-${Date.now()}` };
  }

  /**
   * Update notification status in the database
   */
  private async updateNotificationStatus(
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
  }

  /**
   * Simulate async operation delay (for placeholder implementations)
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
