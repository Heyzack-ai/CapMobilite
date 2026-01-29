import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/database/prisma.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  VerifyPrescriptionDto,
  RejectPrescriptionDto,
  LinkCaseDto,
} from './dto';
import {
  UserRole,
  PrescriptionStatus,
  VerificationStatus,
  DocumentType,
} from '@common/enums';
import { PaginationQueryDto, PaginatedResponseDto } from '@common/dto';

// Maximum age for a valid prescription (6 months)
const PRESCRIPTION_VALIDITY_MONTHS = 6;

interface PrescriptionFilter {
  patientId?: string;
  status?: PrescriptionStatus;
  prescriberId?: string;
}

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new prescription with document reference
   */
  async create(
    dto: CreatePrescriptionDto,
    userId: string,
    userRole: UserRole,
  ) {
    // Verify the document exists and is a prescription type
    const document = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.documentType !== DocumentType.PRESCRIPTION) {
      throw new BadRequestException(
        'Document must be of type PRESCRIPTION',
      );
    }

    // Determine patient ID based on user role
    let patientId: string;
    let prescriberId: string | undefined;

    if (userRole === UserRole.PATIENT) {
      // Patient uploading their own prescription
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
      });

      if (!patientProfile) {
        throw new NotFoundException('Patient profile not found');
      }

      patientId = patientProfile.id;
    } else if (userRole === UserRole.PRESCRIBER) {
      // Prescriber uploading for a patient
      if (!dto.patientId) {
        throw new BadRequestException(
          'Patient ID is required when prescriber uploads a prescription',
        );
      }

      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { id: dto.patientId },
      });

      if (!patientProfile) {
        throw new NotFoundException('Patient not found');
      }

      patientId = dto.patientId;

      // Get prescriber profile
      const prescriberProfile = await this.prisma.prescriberProfile.findUnique({
        where: { userId },
      });

      if (prescriberProfile) {
        prescriberId = prescriberProfile.id;
      }
    } else if (userRole === UserRole.OPS || userRole === UserRole.COMPLIANCE_ADMIN) {
      // Staff uploading on behalf of patient
      if (!dto.patientId) {
        throw new BadRequestException(
          'Patient ID is required when staff uploads a prescription',
        );
      }

      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { id: dto.patientId },
      });

      if (!patientProfile) {
        throw new NotFoundException('Patient not found');
      }

      patientId = dto.patientId;
    } else {
      throw new ForbiddenException(
        'You do not have permission to create prescriptions',
      );
    }

    // Validate prescription date
    const prescriptionDate = new Date(dto.prescriptionDate);
    this.validatePrescriptionDate(prescriptionDate);

    // Calculate expiration date (6 months from prescription date)
    const expirationDate = new Date(prescriptionDate);
    expirationDate.setMonth(expirationDate.getMonth() + PRESCRIPTION_VALIDITY_MONTHS);

    // Determine initial verification status
    const verificationStatus = this.determineInitialStatus(prescriptionDate);

    // Store prescriber info in metadata if provided
    const metadata: Record<string, any> = {};
    if (dto.prescriberRppsNumber) {
      metadata.prescriberRppsNumber = dto.prescriberRppsNumber;
    }
    if (dto.prescriberAdeliNumber) {
      metadata.prescriberAdeliNumber = dto.prescriberAdeliNumber;
    }
    if (dto.prescriberName) {
      metadata.prescriberName = dto.prescriberName;
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        patientId,
        prescriberId,
        documentId: dto.documentId,
        prescriptionDate,
        expirationDate,
        productCategory: dto.productCategory,
        clinicalNotes: dto.clinicalNotes,
        verificationStatus,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        prescriber: true,
        document: true,
      },
    });

    // Update document metadata with prescriber info if provided
    if (Object.keys(metadata).length > 0) {
      await this.prisma.document.update({
        where: { id: dto.documentId },
        data: {
          metadata: {
            ...(document.metadata as Record<string, any> || {}),
            prescriber: metadata,
          },
        },
      });
    }

    this.logger.log(`Prescription created: ${prescription.id}`);

    return this.formatPrescriptionResponse(prescription);
  }

  /**
   * Get a single prescription by ID
   */
  async findOne(id: string, userId: string, userRole: UserRole) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        prescriber: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        document: true,
        verifier: {
          select: {
            id: true,
            email: true,
          },
        },
        cases: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Check access permissions
    this.checkAccessPermission(prescription, userId, userRole);

    return this.formatPrescriptionResponse(prescription);
  }

  /**
   * List prescriptions with filtering and pagination
   */
  async findAll(
    userId: string,
    userRole: UserRole,
    pagination: PaginationQueryDto,
    filter?: PrescriptionFilter,
  ) {
    const { cursor, limit = 20 } = pagination;

    // Build where clause based on role
    const where: any = {};

    if (userRole === UserRole.PATIENT) {
      // Patients can only see their own prescriptions
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
      });

      if (!patientProfile) {
        throw new NotFoundException('Patient profile not found');
      }

      where.patientId = patientProfile.id;
    } else if (userRole === UserRole.PRESCRIBER) {
      // Prescribers can see prescriptions they created
      const prescriberProfile = await this.prisma.prescriberProfile.findUnique({
        where: { userId },
      });

      if (prescriberProfile) {
        where.prescriberId = prescriberProfile.id;
      }
    }
    // OPS and COMPLIANCE_ADMIN can see all prescriptions

    // Apply additional filters
    if (filter?.patientId && (userRole === UserRole.OPS || userRole === UserRole.COMPLIANCE_ADMIN)) {
      where.patientId = filter.patientId;
    }

    if (filter?.status) {
      where.verificationStatus = this.mapPrescriptionStatusToVerificationStatus(filter.status);
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        prescriber: true,
        document: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
          },
        },
        cases: {
          select: {
            id: true,
            caseNumber: true,
          },
        },
      },
    });

    const hasMore = prescriptions.length > limit;
    const data = hasMore ? prescriptions.slice(0, -1) : prescriptions;
    const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

    return new PaginatedResponseDto(
      data.map((p) => this.formatPrescriptionResponse(p)),
      {
        cursor: nextCursor,
        hasMore,
        limit,
      },
    );
  }

  /**
   * Update prescription details
   */
  async update(
    id: string,
    dto: UpdatePrescriptionDto,
    userId: string,
    userRole: UserRole,
  ) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        document: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only OPS, COMPLIANCE_ADMIN, or the prescriber can update
    this.checkModifyPermission(prescription, userId, userRole);

    // Cannot update verified prescriptions
    if (prescription.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Cannot update a verified prescription');
    }

    const updateData: any = {};

    if (dto.prescriptionDate) {
      const prescriptionDate = new Date(dto.prescriptionDate);
      this.validatePrescriptionDate(prescriptionDate);
      updateData.prescriptionDate = prescriptionDate;

      // Recalculate expiration date
      const expirationDate = new Date(prescriptionDate);
      expirationDate.setMonth(expirationDate.getMonth() + PRESCRIPTION_VALIDITY_MONTHS);
      updateData.expirationDate = expirationDate;
    }

    if (dto.productCategory) {
      updateData.productCategory = dto.productCategory;
    }

    if (dto.clinicalNotes !== undefined) {
      updateData.clinicalNotes = dto.clinicalNotes;
    }

    // Update prescriber info in document metadata
    if (dto.prescriberRppsNumber || dto.prescriberAdeliNumber || dto.prescriberName) {
      const existingMetadata = (prescription.document.metadata as Record<string, any>) || {};
      const prescriberMetadata = existingMetadata.prescriber || {};

      if (dto.prescriberRppsNumber) {
        prescriberMetadata.prescriberRppsNumber = dto.prescriberRppsNumber;
      }
      if (dto.prescriberAdeliNumber) {
        prescriberMetadata.prescriberAdeliNumber = dto.prescriberAdeliNumber;
      }
      if (dto.prescriberName) {
        prescriberMetadata.prescriberName = dto.prescriberName;
      }

      await this.prisma.document.update({
        where: { id: prescription.documentId },
        data: {
          metadata: {
            ...existingMetadata,
            prescriber: prescriberMetadata,
          },
        },
      });
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        prescriber: true,
        document: true,
      },
    });

    this.logger.log(`Prescription updated: ${id}`);

    return this.formatPrescriptionResponse(updated);
  }

  /**
   * Verify a prescription (OPS only)
   */
  async verify(
    id: string,
    dto: VerifyPrescriptionDto,
    userId: string,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException(
        'Only OPS or Compliance Admin can verify prescriptions',
      );
    }

    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Prescription is already verified');
    }

    // Check prescription validity before verifying
    const prescriptionDate = new Date(prescription.prescriptionDate);
    if (!this.isPrescriptionValid(prescriptionDate)) {
      throw new BadRequestException(
        'Cannot verify an expired prescription (older than 6 months)',
      );
    }

    // Placeholder for RPPS/ADELI validation
    const metadata = (prescription.document.metadata as Record<string, any>) || {};
    const prescriberInfo = metadata.prescriber || {};

    if (prescriberInfo.prescriberRppsNumber) {
      const isRppsValid = await this.validateRppsNumber(prescriberInfo.prescriberRppsNumber);
      if (!isRppsValid) {
        this.logger.warn(`RPPS validation failed for prescription ${id}`);
        // Note: In production, you might want to reject here or flag for manual review
      }
    }

    if (prescriberInfo.prescriberAdeliNumber) {
      const isAdeliValid = await this.validateAdeliNumber(prescriberInfo.prescriberAdeliNumber);
      if (!isAdeliValid) {
        this.logger.warn(`ADELI validation failed for prescription ${id}`);
      }
    }

    const verified = await this.prisma.prescription.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        prescriber: true,
        document: true,
        verifier: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Prescription verified: ${id} by user ${userId}`);

    return this.formatPrescriptionResponse(verified);
  }

  /**
   * Reject a prescription with reason
   */
  async reject(
    id: string,
    dto: RejectPrescriptionDto,
    userId: string,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException(
        'Only OPS or Compliance Admin can reject prescriptions',
      );
    }

    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Cannot reject a verified prescription');
    }

    // Store rejection reason in document metadata
    const document = await this.prisma.document.findUnique({
      where: { id: prescription.documentId },
    });

    const existingMetadata = (document?.metadata as Record<string, any>) || {};

    await this.prisma.document.update({
      where: { id: prescription.documentId },
      data: {
        metadata: {
          ...existingMetadata,
          rejection: {
            reason: dto.reason,
            rejectedBy: userId,
            rejectedAt: new Date().toISOString(),
          },
        },
      },
    });

    const rejected = await this.prisma.prescription.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        verifiedBy: userId,
        verifiedAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        prescriber: true,
        document: true,
      },
    });

    this.logger.log(`Prescription rejected: ${id} by user ${userId}. Reason: ${dto.reason}`);

    return {
      ...this.formatPrescriptionResponse(rejected),
      rejectionReason: dto.reason,
    };
  }

  /**
   * Link prescription to an existing case
   */
  async linkToCase(
    id: string,
    dto: LinkCaseDto,
    userId: string,
    userRole: UserRole,
  ) {
    if (
      userRole !== UserRole.OPS &&
      userRole !== UserRole.COMPLIANCE_ADMIN &&
      userRole !== UserRole.PATIENT
    ) {
      throw new ForbiddenException(
        'You do not have permission to link prescriptions to cases',
      );
    }

    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Patients can only link their own prescriptions
    if (userRole === UserRole.PATIENT) {
      if (prescription.patient.user.id !== userId) {
        throw new ForbiddenException('You can only link your own prescriptions');
      }
    }

    const targetCase = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
    });

    if (!targetCase) {
      throw new NotFoundException('Case not found');
    }

    // Verify the case belongs to the same patient
    if (targetCase.patientId !== prescription.patientId) {
      throw new BadRequestException(
        'Cannot link prescription to a case belonging to a different patient',
      );
    }

    // Update the case to reference this prescription
    const updated = await this.prisma.case.update({
      where: { id: dto.caseId },
      data: {
        prescriptionId: id,
      },
      include: {
        prescription: {
          include: {
            document: true,
          },
        },
      },
    });

    this.logger.log(`Prescription ${id} linked to case ${dto.caseId}`);

    return {
      prescriptionId: id,
      caseId: dto.caseId,
      caseNumber: updated.caseNumber,
      linkedAt: new Date(),
    };
  }

  /**
   * Auto-expire old prescriptions (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoExpireOldPrescriptions() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - PRESCRIPTION_VALIDITY_MONTHS);

    const result = await this.prisma.prescription.updateMany({
      where: {
        prescriptionDate: {
          lt: sixMonthsAgo,
        },
        verificationStatus: VerificationStatus.PENDING,
      },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Auto-expired ${result.count} prescriptions older than 6 months`);
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validate prescription date is not in the future and not older than 6 months
   */
  private validatePrescriptionDate(date: Date): void {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - PRESCRIPTION_VALIDITY_MONTHS);

    if (date > now) {
      throw new BadRequestException('Prescription date cannot be in the future');
    }

    // Note: We allow uploading old prescriptions but they will be marked as expired
  }

  /**
   * Check if a prescription is still valid (less than 6 months old)
   */
  private isPrescriptionValid(prescriptionDate: Date): boolean {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - PRESCRIPTION_VALIDITY_MONTHS);
    return prescriptionDate >= sixMonthsAgo;
  }

  /**
   * Determine initial verification status based on prescription date
   */
  private determineInitialStatus(prescriptionDate: Date): VerificationStatus {
    if (!this.isPrescriptionValid(prescriptionDate)) {
      return VerificationStatus.REJECTED; // Expired
    }
    return VerificationStatus.PENDING;
  }

  /**
   * Map PrescriptionStatus enum to VerificationStatus enum
   */
  private mapPrescriptionStatusToVerificationStatus(
    status: PrescriptionStatus,
  ): VerificationStatus {
    switch (status) {
      case PrescriptionStatus.PENDING_VERIFICATION:
        return VerificationStatus.PENDING;
      case PrescriptionStatus.VERIFIED:
        return VerificationStatus.VERIFIED;
      case PrescriptionStatus.REJECTED:
      case PrescriptionStatus.EXPIRED:
        return VerificationStatus.REJECTED;
      default:
        return VerificationStatus.PENDING;
    }
  }

  /**
   * Placeholder for RPPS number validation
   * In production, this would call an external API
   */
  private async validateRppsNumber(rppsNumber: string): Promise<boolean> {
    // RPPS numbers are 11 digits
    if (!/^\d{11}$/.test(rppsNumber)) {
      return false;
    }
    // TODO: Implement actual RPPS validation against official database
    this.logger.debug(`RPPS validation placeholder for: ${rppsNumber}`);
    return true;
  }

  /**
   * Placeholder for ADELI number validation
   * In production, this would call an external API
   */
  private async validateAdeliNumber(adeliNumber: string): Promise<boolean> {
    // ADELI numbers are 9 digits
    if (!/^\d{9}$/.test(adeliNumber)) {
      return false;
    }
    // TODO: Implement actual ADELI validation against official database
    this.logger.debug(`ADELI validation placeholder for: ${adeliNumber}`);
    return true;
  }

  /**
   * Check if user has permission to view the prescription
   */
  private checkAccessPermission(
    prescription: any,
    userId: string,
    userRole: UserRole,
  ): void {
    // Staff can view all prescriptions
    if (
      userRole === UserRole.OPS ||
      userRole === UserRole.COMPLIANCE_ADMIN ||
      userRole === UserRole.BILLING
    ) {
      return;
    }

    // Patients can view their own prescriptions
    if (userRole === UserRole.PATIENT) {
      if (prescription.patient?.user?.id === userId) {
        return;
      }
      throw new ForbiddenException('You do not have access to this prescription');
    }

    // Prescribers can view prescriptions they created
    if (userRole === UserRole.PRESCRIBER) {
      if (prescription.prescriber?.user?.id === userId) {
        return;
      }
      throw new ForbiddenException('You do not have access to this prescription');
    }

    throw new ForbiddenException('You do not have access to this prescription');
  }

  /**
   * Check if user has permission to modify the prescription
   */
  private checkModifyPermission(
    prescription: any,
    userId: string,
    userRole: UserRole,
  ): void {
    // Staff can modify all prescriptions
    if (userRole === UserRole.OPS || userRole === UserRole.COMPLIANCE_ADMIN) {
      return;
    }

    // Prescribers can modify prescriptions they created
    if (userRole === UserRole.PRESCRIBER) {
      if (prescription.prescriber?.user?.id === userId) {
        return;
      }
    }

    throw new ForbiddenException('You do not have permission to modify this prescription');
  }

  /**
   * Format prescription for API response
   */
  private formatPrescriptionResponse(prescription: any): any {
    const metadata = (prescription.document?.metadata as Record<string, any>) || {};
    const prescriberInfo = metadata.prescriber || {};
    const rejectionInfo = metadata.rejection || {};

    // Map verification status to prescription status
    let status: PrescriptionStatus;
    if (prescription.verificationStatus === VerificationStatus.PENDING) {
      status = PrescriptionStatus.PENDING_VERIFICATION;
    } else if (prescription.verificationStatus === VerificationStatus.VERIFIED) {
      status = PrescriptionStatus.VERIFIED;
    } else {
      // Check if it's expired or rejected
      const prescriptionDate = new Date(prescription.prescriptionDate);
      if (!this.isPrescriptionValid(prescriptionDate)) {
        status = PrescriptionStatus.EXPIRED;
      } else {
        status = PrescriptionStatus.REJECTED;
      }
    }

    return {
      id: prescription.id,
      patientId: prescription.patientId,
      prescriberId: prescription.prescriberId,
      documentId: prescription.documentId,
      prescriptionDate: prescription.prescriptionDate,
      expirationDate: prescription.expirationDate,
      productCategory: prescription.productCategory,
      clinicalNotes: prescription.clinicalNotes,
      status,
      verificationStatus: prescription.verificationStatus,
      verifiedAt: prescription.verifiedAt,
      createdAt: prescription.createdAt,
      patient: prescription.patient
        ? {
            id: prescription.patient.id,
            firstName: prescription.patient.firstName,
            lastName: prescription.patient.lastName,
            email: prescription.patient.user?.email,
          }
        : undefined,
      prescriber: prescription.prescriber
        ? {
            id: prescription.prescriber.id,
            rppsNumber: prescription.prescriber.rppsNumber,
            adeliNumber: prescription.prescriber.adeliNumber,
            specialty: prescription.prescriber.specialty,
            practiceName: prescription.prescriber.practiceName,
          }
        : undefined,
      prescriberInfo: Object.keys(prescriberInfo).length > 0 ? prescriberInfo : undefined,
      verifier: prescription.verifier
        ? {
            id: prescription.verifier.id,
            email: prescription.verifier.email,
          }
        : undefined,
      document: prescription.document
        ? {
            id: prescription.document.id,
            filename: prescription.document.filename,
            mimeType: prescription.document.mimeType,
            scanStatus: prescription.document.scanStatus,
          }
        : undefined,
      cases: prescription.cases,
      rejectionReason: rejectionInfo.reason,
    };
  }
}
