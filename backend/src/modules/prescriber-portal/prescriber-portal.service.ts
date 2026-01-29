import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UserRole } from '@common/enums';
import { GeneratePrescriberLinkDto, SubmitPrescriptionDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class PrescriberPortalService {
  private readonly logger = new Logger(PrescriberPortalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a one-time prescriber link for uploading prescriptions
   */
  async generateLink(
    dto: GeneratePrescriberLinkDto,
    userId: string,
    userRole: UserRole,
  ) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
      include: { user: { select: { id: true } } },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole);
    if (!isStaff && patient.user.id !== userId) {
      throw new ForbiddenException('You can only generate links for yourself');
    }

    const token = randomBytes(32).toString('hex');
    const expiresInHours = dto.expiresInHours || 168;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const prescriberLink = await this.prisma.prescriberLink.create({
      data: {
        patientId: dto.patientId,
        token,
        expiresAt,
        createdBy: userId,
      },
    });

    const baseUrl = this.configService.get<string>('APP_URL') || 'https://app.example.com';
    const linkUrl = `${baseUrl}/prescriber/upload/${token}`;

    if (dto.prescriberEmail) {
      this.logger.log(`Prescriber link email would be sent to: ${dto.prescriberEmail}`);
    }

    this.logger.log(`Prescriber link generated for patient ${dto.patientId}`);

    return {
      linkUrl,
      linkId: prescriberLink.id,
      expiresAt,
      patientReference: `${patient.firstName} ${patient.lastName.charAt(0)}.`,
    };
  }

  /**
   * Validate a prescriber link (public endpoint)
   */
  async validateLink(token: string) {
    const link = await this.prisma.prescriberLink.findUnique({
      where: { token },
      include: { patient: true },
    });

    if (!link) {
      return { valid: false, reason: 'Invalid or expired link' };
    }

    if (link.usedAt) {
      return { valid: false, reason: 'This link has already been used', alreadyUsed: true };
    }

    if (new Date() > link.expiresAt) {
      return { valid: false, reason: 'This link has expired' };
    }

    return {
      valid: true,
      patientFirstName: link.patient.firstName,
      patientLastInitial: link.patient.lastName.charAt(0) + '.',
      expiresAt: link.expiresAt,
      alreadyUsed: false,
    };
  }

  /**
   * Submit prescription via prescriber link (public endpoint)
   */
  async submitPrescription(token: string, dto: SubmitPrescriptionDto) {
    const link = await this.prisma.prescriberLink.findUnique({
      where: { token },
      include: { patient: { include: { user: { select: { id: true } } } } },
    });

    if (!link) {
      throw new NotFoundException('Invalid or expired link');
    }

    if (link.usedAt) {
      throw new BadRequestException('This link has already been used');
    }

    if (new Date() > link.expiresAt) {
      throw new BadRequestException('This link has expired');
    }

    const prescriptionDoc = await this.prisma.document.findUnique({
      where: { id: dto.prescriptionDocumentId },
    });

    if (!prescriptionDoc) {
      throw new NotFoundException('Prescription document not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const prescription = await tx.prescription.create({
        data: {
          patientId: link.patientId,
          productCategory: dto.productCategory,
          verificationStatus: 'PENDING',
          clinicalNotes: dto.notes,
          documentId: dto.prescriptionDocumentId,
          prescriptionDate: new Date(),
        },
      });

      await tx.prescriberLink.update({
        where: { id: link.id },
        data: { usedAt: new Date(), prescriptionId: prescription.id },
      });

      return prescription;
    });

    const referenceNumber = `PRE-${result.id.substring(0, 8).toUpperCase()}`;

    this.logger.log(`Prescription submitted via link for patient ${link.patientId}`);

    return {
      message: 'Prescription submitted successfully',
      prescriptionId: result.id,
      referenceNumber,
    };
  }

  /**
   * List prescriber links for a patient
   */
  async listLinks(patientId: string, userId: string, userRole: UserRole) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: { select: { id: true } } },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole);
    if (!isStaff && patient.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const links = await this.prisma.prescriberLink.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: links.map((link) => ({
        id: link.id,
        expiresAt: link.expiresAt,
        usedAt: link.usedAt,
        createdAt: link.createdAt,
        prescriptionId: link.prescriptionId,
      })),
      total: links.length,
    };
  }

  /**
   * Revoke a prescriber link
   */
  async revokeLink(linkId: string, userId: string, userRole: UserRole) {
    const link = await this.prisma.prescriberLink.findUnique({
      where: { id: linkId },
      include: { patient: { include: { user: { select: { id: true } } } } },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    const isStaff = [UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole);
    if (!isStaff && link.patient.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (link.usedAt) {
      throw new BadRequestException('Cannot revoke a link that has already been used');
    }

    await this.prisma.prescriberLink.update({
      where: { id: linkId },
      data: { expiresAt: new Date() },
    });

    this.logger.log(`Prescriber link ${linkId} revoked`);

    return { message: 'Link revoked successfully' };
  }
}
