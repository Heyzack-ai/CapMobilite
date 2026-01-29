import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { QueueService, QUEUE_NAMES } from '@integrations/queue';
import {
  ProxyRelationshipType,
  ProxyStatus,
  UserRole,
  NotificationChannel,
} from '@common/enums';
import { generateSecureToken } from '@common/utils';
import {
  InviteProxyDto,
  AcceptProxyInvitationDto,
  SwitchPatientContextDto,
  UpdateProxyDto,
  ProxyRelationshipResponseDto,
  PatientsListResponseDto,
  ProxiesListResponseDto,
  ProxyInvitationResponseDto,
} from './dto';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Invite a proxy to act on behalf of the patient
   */
  async inviteProxy(
    userId: string,
    dto: InviteProxyDto,
  ): Promise<ProxyInvitationResponseDto> {
    // Get patient profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Check if proxy user already exists
    const existingProxyUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Check for existing active relationship
    if (existingProxyUser) {
      const existingRelationship = await this.prisma.proxyRelationship.findFirst({
        where: {
          patientId: user.patientProfile.id,
          proxyUserId: existingProxyUser.id,
          status: ProxyStatus.ACTIVE,
        },
      });

      if (existingRelationship) {
        throw new ConflictException('This person is already an active proxy for this patient');
      }
    }

    // Create invitation token
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invitation
    const invitation = await this.prisma.proxyInvitation.create({
      data: {
        patientId: user.patientProfile.id,
        email: dto.email.toLowerCase(),
        relationship: dto.relationship,
        token,
        expiresAt,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        consentDocumentId: dto.consentDocumentId || null,
      },
    });

    // Queue notification email
    await this.queueService.addJob(
      QUEUE_NAMES.NOTIFICATIONS,
      'send-notification',
      {
        channel: NotificationChannel.EMAIL,
        templateId: 'proxy-invitation',
        recipientEmail: dto.email,
        context: {
          patientName: `${user.patientProfile.firstName} ${user.patientProfile.lastName}`,
          relationship: dto.relationship,
          inviteLink: `${process.env.FRONTEND_URL}/proxy/accept?token=${token}`,
          expiresAt: expiresAt.toISOString(),
        },
      },
    );

    this.logger.log(
      `Proxy invitation sent to ${dto.email} for patient ${user.patientProfile.id}`,
    );

    return {
      id: invitation.id,
      email: invitation.email,
      relationship: invitation.relationship as unknown as ProxyRelationshipType,
      status: 'PENDING',
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Accept a proxy invitation
   */
  async acceptInvitation(
    userId: string,
    dto: AcceptProxyInvitationDto,
  ): Promise<ProxyRelationshipResponseDto> {
    // Find the invitation
    const invitation = await this.prisma.proxyInvitation.findFirst({
      where: {
        token: dto.token,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Get the accepting user
    const proxyUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!proxyUser) {
      throw new NotFoundException('User not found');
    }

    // Verify email matches
    if (proxyUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    // Create proxy relationship
    const relationship = await this.prisma.$transaction(async (tx) => {
      // Mark invitation as used
      await tx.proxyInvitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      // Create consent document placeholder if not provided
      let consentDocumentId = invitation.consentDocumentId;
      if (!consentDocumentId) {
        // Create a placeholder - in production this would require an actual document
        const placeholderDoc = await tx.document.create({
          data: {
            ownerId: invitation.patientId,
            ownerType: 'PATIENT',
            documentType: 'OTHER',
            filename: 'proxy-consent-placeholder.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 0,
            storageKey: `proxy-consents/${invitation.id}/placeholder`,
            sha256Hash: 'placeholder',
          },
        });
        consentDocumentId = placeholderDoc.id;
      }

      // Create the relationship
      return tx.proxyRelationship.create({
        data: {
          patientId: invitation.patientId,
          proxyUserId: userId,
          relationship: invitation.relationship,
          consentDocumentId,
          validFrom: new Date(),
          validUntil: invitation.validUntil,
          status: ProxyStatus.ACTIVE,
        },
        include: {
          patient: {
            include: { user: true },
          },
          proxyUser: true,
        },
      });
    });

    this.logger.log(
      `Proxy relationship created: ${userId} -> patient ${invitation.patientId}`,
    );

    return this.mapToResponse(relationship);
  }

  /**
   * Get list of patients the current user can act for
   */
  async getPatients(userId: string): Promise<PatientsListResponseDto> {
    const relationships = await this.prisma.proxyRelationship.findMany({
      where: {
        proxyUserId: userId,
        status: ProxyStatus.ACTIVE,
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } },
        ],
      },
      include: {
        patient: {
          include: { user: true },
        },
        proxyUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = relationships.map((rel) => this.mapToResponse(rel));

    return {
      data,
      total: data.length,
    };
  }

  /**
   * Get list of proxies for the current patient
   */
  async getProxies(userId: string): Promise<ProxiesListResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const relationships = await this.prisma.proxyRelationship.findMany({
      where: {
        patientId: user.patientProfile.id,
        status: ProxyStatus.ACTIVE,
      },
      include: {
        patient: {
          include: { user: true },
        },
        proxyUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = relationships.map((rel) => this.mapToResponse(rel));

    return {
      data,
      total: data.length,
    };
  }

  /**
   * Switch context to act as a specific patient
   * Returns the patient profile ID to use in subsequent requests
   */
  async switchPatientContext(
    userId: string,
    dto: SwitchPatientContextDto,
  ): Promise<{ patientId: string; patientName: string }> {
    // Verify the proxy relationship exists and is active
    const relationship = await this.prisma.proxyRelationship.findFirst({
      where: {
        proxyUserId: userId,
        patientId: dto.patientId,
        status: ProxyStatus.ACTIVE,
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } },
        ],
      },
      include: {
        patient: true,
      },
    });

    if (!relationship) {
      throw new ForbiddenException('You do not have permission to act as this patient');
    }

    this.logger.log(`User ${userId} switched context to patient ${dto.patientId}`);

    return {
      patientId: relationship.patientId,
      patientName: `${relationship.patient.firstName} ${relationship.patient.lastName}`,
    };
  }

  /**
   * Revoke a proxy relationship
   */
  async revokeProxy(
    userId: string,
    proxyRelationshipId: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const relationship = await this.prisma.proxyRelationship.findFirst({
      where: {
        id: proxyRelationshipId,
        patientId: user.patientProfile.id,
        status: ProxyStatus.ACTIVE,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Proxy relationship not found');
    }

    await this.prisma.proxyRelationship.update({
      where: { id: proxyRelationshipId },
      data: { status: ProxyStatus.REVOKED },
    });

    this.logger.log(
      `Proxy relationship ${proxyRelationshipId} revoked by patient ${user.patientProfile.id}`,
    );

    return {
      message: 'Proxy relationship has been revoked',
    };
  }

  /**
   * Map database entity to response DTO
   */
  private mapToResponse(relationship: any): ProxyRelationshipResponseDto {
    return {
      id: relationship.id,
      patientId: relationship.patientId,
      patientName: `${relationship.patient.firstName} ${relationship.patient.lastName}`,
      proxyUserId: relationship.proxyUserId,
      proxyName: relationship.proxyUser.email, // Use email as name for now
      relationship: relationship.relationship,
      status: relationship.status,
      validFrom: relationship.validFrom,
      validUntil: relationship.validUntil,
      createdAt: relationship.createdAt,
    };
  }
}
