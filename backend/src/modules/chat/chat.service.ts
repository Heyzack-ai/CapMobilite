import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UserRole } from '@common/enums';
import {
  CreateChatSessionDto,
  SendMessageDto,
  EscalateChatDto,
  ResolveChatDto,
} from './dto';
import { PaginationQueryDto } from '@common/dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new chat session
   */
  async createSession(
    dto: CreateChatSessionDto,
    userId: string,
    userRole: UserRole,
  ) {
    // If caseId provided, verify access
    if (dto.caseId) {
      const caseRecord = await this.prisma.case.findUnique({
        where: { id: dto.caseId },
        include: { patient: { include: { user: { select: { id: true } } } } },
      });

      if (!caseRecord) {
        throw new NotFoundException('Case not found');
      }

      const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN].includes(userRole);
      if (!isStaff && caseRecord.patient.user.id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Create session
    const session = await this.prisma.chatSession.create({
      data: {
        userId,
        status: 'ACTIVE',
      },
    });

    // Add initial message if provided
    if (dto.initialMessage) {
      await this.prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          senderId: userId,
          senderType: 'USER',
          content: dto.initialMessage,
        },
      });
    }

    this.logger.log(`Chat session ${session.id} created by user ${userId}`);

    return this.formatSessionResponse(session);
  }

  /**
   * Get user's chat sessions
   */
  async getUserSessions(
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto & { status?: string },
  ) {
    const { limit = 20, cursor, status } = query;

    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole);

    const where: any = {};

    if (isStaff) {
      // Staff see all sessions, or assigned to them
      if (status) where.status = status;
    } else {
      // Patients only see their own sessions
      where.userId = userId;
      if (status) where.status = status;
    }

    const sessions = await this.prisma.chatSession.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, email: true } },
        _count: { select: { messages: true } },
      },
    });

    const hasMore = sessions.length > limit;
    const data = hasMore ? sessions.slice(0, -1) : sessions;

    return {
      data: data.map((s) => ({
        ...this.formatSessionResponse(s),
        user: s.user,
        messageCount: s._count.messages,
      })),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Get a specific chat session
   */
  async getSession(
    sessionId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (!this.canAccessSession(session, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...this.formatSessionResponse(session),
      user: session.user,
    };
  }

  /**
   * Send a message in a chat session
   */
  async sendMessage(
    sessionId: string,
    dto: SendMessageDto,
    userId: string,
    userRole: UserRole,
  ) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (!this.canAccessSession(session, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    if (session.status === 'CLOSED') {
      throw new BadRequestException('Cannot send messages to a closed session');
    }

    const senderType = session.userId === userId ? 'USER' : 'STAFF';

    // Create message
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderId: userId,
        senderType,
        content: dto.content,
        metadata: dto.attachmentIds ? { attachmentIds: dto.attachmentIds } : undefined,
      },
    });

    // Update session's updatedAt
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    this.logger.log(`Message sent in session ${sessionId} by user ${userId}`);

    return this.formatMessageResponse(message);
  }

  /**
   * Get messages in a chat session
   */
  async getMessages(
    sessionId: string,
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto,
  ) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (!this.canAccessSession(session, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    const { limit = 50, cursor } = query;

    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'asc' },
    });

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, -1) : messages;

    return {
      data: data.map((m) => this.formatMessageResponse(m)),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Escalate a chat session to human support
   */
  async escalateSession(
    sessionId: string,
    dto: EscalateChatDto,
    userId: string,
    userRole: UserRole,
  ) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (!this.canAccessSession(session, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    if (session.status === 'ESCALATED') {
      throw new BadRequestException('Session is already escalated');
    }

    // Update session status
    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'ESCALATED',
        escalatedAt: new Date(),
      },
    });

    // Add system message
    await this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderId: null,
        senderType: 'SYSTEM',
        content: `Session escalated: ${dto.reason}`,
      },
    });

    this.logger.log(`Chat session ${sessionId} escalated: ${dto.reason}`);

    // TODO: Notify support team
    // await this.notificationService.notifySupportTeam(...)

    return this.formatSessionResponse(updated);
  }

  /**
   * Resolve a chat session
   */
  async resolveSession(
    sessionId: string,
    dto: ResolveChatDto,
    userId: string,
    userRole: UserRole,
  ) {
    // Only staff can resolve sessions
    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole);
    if (!isStaff) {
      throw new ForbiddenException('Only staff can resolve sessions');
    }

    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (session.status === 'CLOSED') {
      throw new BadRequestException('Session is already closed');
    }

    // Update session status
    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // Add system message
    await this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderId: null,
        senderType: 'SYSTEM',
        content: `Session resolved${dto.resolutionNotes ? `: ${dto.resolutionNotes}` : ''}`,
      },
    });

    this.logger.log(`Chat session ${sessionId} resolved by ${userId}`);

    return this.formatSessionResponse(updated);
  }

  /**
   * Close a chat session
   */
  async closeSession(
    sessionId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    // User can close their own session, staff can close any
    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole);
    if (!isStaff && session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (session.status === 'CLOSED') {
      throw new BadRequestException('Session is already closed');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    this.logger.log(`Chat session ${sessionId} closed`);

    return this.formatSessionResponse(updated);
  }

  /**
   * Assign a chat session to a staff member (not supported in current schema)
   */
  async assignSession(
    sessionId: string,
    assigneeId: string,
    userId: string,
    userRole: UserRole,
  ) {
    // Note: Current schema doesn't support assignment
    // This would require adding assignedToId field to ChatSession model
    throw new BadRequestException('Session assignment not yet implemented');
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private canAccessSession(session: any, userId: string, userRole: UserRole): boolean {
    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN].includes(userRole);
    return isStaff || session.userId === userId;
  }

  private formatSessionResponse(session: any) {
    return {
      id: session.id,
      userId: session.userId,
      patientId: session.patientId,
      status: session.status,
      escalatedAt: session.escalatedAt,
      closedAt: session.closedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private formatMessageResponse(message: any) {
    return {
      id: message.id,
      sessionId: message.sessionId,
      senderId: message.senderId,
      senderType: message.senderType,
      content: message.content,
      metadata: message.metadata,
      createdAt: message.createdAt,
    };
  }
}
