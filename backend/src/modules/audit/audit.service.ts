import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { QueueService, QUEUE_NAMES } from '@integrations/queue';
import { ActorType } from '@common/enums';
import { AuditQueryDto, AuditEventDto } from './dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {
    // Register the audit queue worker
    this.registerWorker();
  }

  private registerWorker() {
    this.queueService.registerWorker(
      QUEUE_NAMES.AUDIT,
      async (job) => {
        const event = job.data as AuditEventDto;
        await this.writeAuditEvent(event);
        return { success: true };
      },
      { concurrency: 10 },
    );

    this.logger.log('Audit worker registered');
  }

  async log(event: AuditEventDto): Promise<void> {
    // Queue the audit event for async processing
    await this.queueService.addJob(
      QUEUE_NAMES.AUDIT,
      'write-audit-event',
      event,
      { attempts: 3 },
    );

    this.logger.debug(
      `Audit event queued: ${event.action} on ${event.objectType}:${event.objectId}`,
    );
  }

  async logSync(event: AuditEventDto): Promise<void> {
    // Write directly for critical events that must be logged immediately
    await this.writeAuditEvent(event);
  }

  private async writeAuditEvent(event: AuditEventDto): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        actorId: event.actorId || null,
        actorType: event.actorType,
        action: event.action,
        objectType: event.objectType,
        objectId: event.objectId,
        changes: event.changes || null,
        ipAddress: event.ipAddress || null,
        userAgent: event.userAgent || null,
        requestId: event.requestId || null,
      },
    });
  }

  async query(query: AuditQueryDto) {
    const where: any = {};

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.objectType) {
      where.objectType = query.objectType;
    }

    if (query.objectId) {
      where.objectId = query.objectId;
    }

    if (query.action) {
      where.action = { contains: query.action };
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    const events = await this.prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: query.limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const hasMore = events.length > query.limit;
    const data = hasMore ? events.slice(0, -1) : events;

    return {
      data,
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit: query.limit,
      },
    };
  }

  // Helper methods for common audit events
  async logLogin(userId: string, ip?: string, userAgent?: string) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'AUTH_LOGIN',
      objectType: 'User',
      objectId: userId,
      ipAddress: ip,
      userAgent,
    });
  }

  async logLogout(userId: string) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'AUTH_LOGOUT',
      objectType: 'User',
      objectId: userId,
    });
  }

  async logPasswordReset(userId: string) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'AUTH_PASSWORD_RESET',
      objectType: 'User',
      objectId: userId,
    });
  }

  async logMfaEnabled(userId: string) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'AUTH_MFA_ENABLED',
      objectType: 'User',
      objectId: userId,
    });
  }

  async logDocumentUpload(userId: string, documentId: string) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'DOCUMENT_UPLOAD',
      objectType: 'Document',
      objectId: documentId,
    });
  }

  async logDocumentDownload(userId: string, documentId: string) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'DOCUMENT_DOWNLOAD',
      objectType: 'Document',
      objectId: documentId,
    });
  }

  async logProfileUpdate(userId: string, changes: Record<string, any>) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'PROFILE_UPDATE',
      objectType: 'User',
      objectId: userId,
      changes,
    });
  }

  async logCaseStatusChange(
    userId: string,
    caseId: string,
    oldStatus: string,
    newStatus: string,
  ) {
    await this.log({
      actorId: userId,
      actorType: ActorType.USER,
      action: 'CASE_STATUS_CHANGE',
      objectType: 'Case',
      objectId: caseId,
      changes: { oldStatus, newStatus },
    });
  }
}
