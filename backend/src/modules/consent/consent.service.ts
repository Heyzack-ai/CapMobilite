import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '@/database/prisma.service';
import { ConsentType } from '@common/enums';
import {
  CreateConsentDto,
  ConsentResponseDto,
  ConsentListResponseDto,
} from './dto';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all consents for the current user
   */
  async getConsents(userId: string): Promise<ConsentListResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const consents = await this.prisma.consent.findMany({
      where: { patientId: user.patientProfile.id },
      orderBy: { consentedAt: 'desc' },
    });

    const data = consents.map((consent) => this.mapToResponse(consent));

    return {
      data,
      total: data.length,
    };
  }

  /**
   * Get a specific consent by type
   */
  async getConsentByType(
    userId: string,
    consentType: ConsentType,
  ): Promise<ConsentResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const consent = await this.prisma.consent.findFirst({
      where: {
        patientId: user.patientProfile.id,
        consentType,
        withdrawnAt: null,
      },
      orderBy: { consentedAt: 'desc' },
    });

    if (!consent) {
      throw new NotFoundException(`No active consent found for type: ${consentType}`);
    }

    return this.mapToResponse(consent);
  }

  /**
   * Create a new consent record
   */
  async createConsent(
    userId: string,
    dto: CreateConsentDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<ConsentResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Check if there's already an active consent of this type
    const existingConsent = await this.prisma.consent.findFirst({
      where: {
        patientId: user.patientProfile.id,
        consentType: dto.consentType,
        withdrawnAt: null,
      },
    });

    if (existingConsent) {
      // If same version, return existing
      if (existingConsent.version === dto.version) {
        return this.mapToResponse(existingConsent);
      }
      // If different version, withdraw old and create new
      await this.prisma.consent.update({
        where: { id: existingConsent.id },
        data: { withdrawnAt: new Date() },
      });
    }

    // Generate text hash if not provided
    const textHash = dto.textHash || this.generateTextHash(dto.consentType, dto.version);

    const consent = await this.prisma.consent.create({
      data: {
        patientId: user.patientProfile.id,
        consentType: dto.consentType,
        version: dto.version,
        textHash,
        ipAddress,
        userAgent,
      },
    });

    this.logger.log(
      `Consent ${dto.consentType} v${dto.version} recorded for patient ${user.patientProfile.id}`,
    );

    return this.mapToResponse(consent);
  }

  /**
   * Withdraw a consent
   */
  async withdrawConsent(
    userId: string,
    consentType: ConsentType,
  ): Promise<{ message: string; withdrawnAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Prevent withdrawal of mandatory consents
    if (consentType === ConsentType.TERMS_OF_SERVICE) {
      throw new BadRequestException(
        'Terms of Service consent cannot be withdrawn. Please contact support if you wish to close your account.',
      );
    }

    const consent = await this.prisma.consent.findFirst({
      where: {
        patientId: user.patientProfile.id,
        consentType,
        withdrawnAt: null,
      },
    });

    if (!consent) {
      throw new NotFoundException(`No active consent found for type: ${consentType}`);
    }

    const withdrawnAt = new Date();

    await this.prisma.consent.update({
      where: { id: consent.id },
      data: { withdrawnAt },
    });

    this.logger.log(
      `Consent ${consentType} withdrawn for patient ${user.patientProfile.id}`,
    );

    return {
      message: `Consent for ${consentType} has been withdrawn`,
      withdrawnAt,
    };
  }

  /**
   * Check if user has given a specific consent
   */
  async hasActiveConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      return false;
    }

    const consent = await this.prisma.consent.findFirst({
      where: {
        patientId: user.patientProfile.id,
        consentType,
        withdrawnAt: null,
      },
    });

    return !!consent;
  }

  /**
   * Generate a placeholder hash for consent text
   */
  private generateTextHash(consentType: ConsentType, version: string): string {
    const content = `${consentType}:${version}`;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Map database entity to response DTO
   */
  private mapToResponse(consent: any): ConsentResponseDto {
    return {
      id: consent.id,
      consentType: consent.consentType,
      version: consent.version,
      textHash: consent.textHash,
      consentedAt: consent.consentedAt,
      withdrawnAt: consent.withdrawnAt,
      isActive: !consent.withdrawnAt,
    };
  }
}
