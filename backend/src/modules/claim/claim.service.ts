import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import {
  ClaimStatus,
  GatewayType,
  QuoteStatus,
  UserRole,
  ClaimDocumentRole,
} from '@common/enums';
import {
  CreateClaimDto,
  UpdateClaimDto,
  CreateClaimReturnDto,
  CreatePaymentDto,
  AttachDocumentRequestDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ClaimService {
  private readonly logger = new Logger(ClaimService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique claim number in format CLM-YYYY-XXXXX
   */
  private async generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CLM-${year}-`;

    // Get the last claim number for this year
    const lastClaim = await this.prisma.claim.findFirst({
      where: {
        claimNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        claimNumber: 'desc',
      },
      select: {
        claimNumber: true,
      },
    });

    let nextNumber = 1;
    if (lastClaim) {
      const lastNumber = parseInt(lastClaim.claimNumber.split('-').pop() || '0', 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Create a new claim from an approved quote
   * Only BILLING role can create claims
   */
  async createClaim(
    dto: CreateClaimDto,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    // Verify user has BILLING role
    if (userRole !== UserRole.BILLING) {
      throw new ForbiddenException('Only BILLING users can create claims');
    }

    // Find the quote and verify it's approved
    const quote = await this.prisma.quote.findUnique({
      where: { id: dto.quoteId },
      include: {
        case: {
          include: {
            patient: true,
            prescription: {
              include: {
                document: true,
              },
            },
          },
        },
        lineItems: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${dto.quoteId} not found`);
    }

    if (quote.status !== QuoteStatus.APPROVED) {
      throw new BadRequestException(
        `Quote must be approved to create a claim. Current status: ${quote.status}`,
      );
    }

    // Check if a claim already exists for this case
    const existingClaim = await this.prisma.claim.findFirst({
      where: {
        caseId: quote.caseId,
        status: {
          notIn: [ClaimStatus.CANCELLED, ClaimStatus.REJECTED],
        },
      },
    });

    if (existingClaim) {
      throw new BadRequestException(
        `An active claim already exists for this case: ${existingClaim.claimNumber}`,
      );
    }

    const claimNumber = await this.generateClaimNumber();

    const claim = await this.prisma.claim.create({
      data: {
        caseId: quote.caseId,
        claimNumber,
        gatewayType: dto.gatewayType || GatewayType.MANUAL,
        status: ClaimStatus.DRAFT,
        totalAmount: quote.totalAmount,
      },
      include: {
        case: {
          include: {
            patient: true,
          },
        },
      },
    });

    this.logger.log(
      `Claim ${claimNumber} created for case ${quote.caseId} by user ${userId}`,
    );

    return this.formatClaimResponse(claim);
  }

  /**
   * List claims with optional filtering
   */
  async listClaims(
    query: {
      cursor?: string;
      limit?: number;
      status?: ClaimStatus;
      caseId?: string;
    },
    userId: string,
    userRole: UserRole,
  ): Promise<{
    data: any[];
    pagination: { cursor?: string; hasMore: boolean; limit: number };
  }> {
    const limit = query.limit || 20;
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.caseId) {
      where.caseId = query.caseId;
    }

    const claims = await this.prisma.claim.findMany({
      where,
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    const hasMore = claims.length > limit;
    const data = hasMore ? claims.slice(0, -1) : claims;

    return {
      data: data.map((claim) => this.formatClaimResponse(claim)),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Get claim details by ID
   */
  async getClaimById(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        case: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            prescription: true,
          },
        },
        claimDocuments: {
          include: {
            document: {
              select: {
                id: true,
                filename: true,
                mimeType: true,
                documentType: true,
              },
            },
          },
        },
        claimReturns: {
          orderBy: { receivedAt: 'desc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    return this.formatClaimResponse(claim);
  }

  /**
   * Update claim details
   */
  async updateClaim(
    id: string,
    dto: UpdateClaimDto,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    // Validate status transitions
    if (dto.status) {
      this.validateStatusTransition(claim.status as ClaimStatus, dto.status);
    }

    const updatedClaim = await this.prisma.claim.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.gatewayRef && { gatewayRef: dto.gatewayRef }),
        ...(dto.gatewayType && { gatewayType: dto.gatewayType }),
        ...(dto.rejectionCode && { rejectionCode: dto.rejectionCode }),
        ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
      },
      include: {
        case: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Claim ${claim.claimNumber} updated by user ${userId}`);

    return this.formatClaimResponse(updatedClaim);
  }

  /**
   * Submit claim to CPAM
   */
  async submitClaim(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        claimDocuments: true,
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException(
        `Claim can only be submitted from DRAFT status. Current status: ${claim.status}`,
      );
    }

    // Verify required documents are attached
    const requiredRoles = [
      ClaimDocumentRole.PRESCRIPTION,
      ClaimDocumentRole.CARTE_VITALE,
      ClaimDocumentRole.QUOTE,
    ];

    const attachedRoles = claim.claimDocuments.map((d) => d.documentRole);
    const missingRoles = requiredRoles.filter(
      (role) => !attachedRoles.includes(role),
    );

    if (missingRoles.length > 0) {
      throw new BadRequestException(
        `Missing required documents: ${missingRoles.join(', ')}`,
      );
    }

    const updatedClaim = await this.prisma.claim.update({
      where: { id },
      data: {
        status: ClaimStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        case: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Claim ${claim.claimNumber} submitted to CPAM by user ${userId}`);

    return this.formatClaimResponse(updatedClaim);
  }

  /**
   * Attach document to claim
   */
  async attachDocument(
    claimId: string,
    dto: AttachDocumentRequestDto,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    // Verify document exists
    const document = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${dto.documentId} not found`);
    }

    // Check if document is already attached
    const existingAttachment = await this.prisma.claimDocument.findFirst({
      where: {
        claimId,
        documentId: dto.documentId,
      },
    });

    if (existingAttachment) {
      throw new BadRequestException('Document is already attached to this claim');
    }

    const claimDocument = await this.prisma.claimDocument.create({
      data: {
        claimId,
        documentId: dto.documentId,
        documentRole: dto.documentRole,
      },
      include: {
        document: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            documentType: true,
          },
        },
      },
    });

    this.logger.log(
      `Document ${dto.documentId} attached to claim ${claim.claimNumber} as ${dto.documentRole}`,
    );

    return claimDocument;
  }

  /**
   * List documents attached to a claim
   */
  async listClaimDocuments(
    claimId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<any[]> {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    const documents = await this.prisma.claimDocument.findMany({
      where: { claimId },
      include: {
        document: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            documentType: true,
            sizeBytes: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return documents;
  }

  /**
   * Record a CPAM return/response
   */
  async createClaimReturn(
    claimId: string,
    dto: CreateClaimReturnDto,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    const claimReturn = await this.prisma.claimReturn.create({
      data: {
        claimId,
        returnType: dto.returnType,
        rawFileStorageKey: dto.rawFileStorageKey,
        parsedData: dto.parsedData || undefined,
        receivedAt: new Date(dto.receivedAt),
      },
    });

    // Update claim status based on return type and parsed data
    // This is a simplified logic - real implementation would parse NOEMIE/ARO files
    this.logger.log(
      `CPAM return (${dto.returnType}) recorded for claim ${claim.claimNumber}`,
    );

    return claimReturn;
  }

  /**
   * List CPAM returns for a claim
   */
  async listClaimReturns(
    claimId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<any[]> {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    const returns = await this.prisma.claimReturn.findMany({
      where: { claimId },
      orderBy: { receivedAt: 'desc' },
    });

    return returns;
  }

  /**
   * Record a payment received
   */
  async createPayment(
    claimId: string,
    dto: CreatePaymentDto,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        payments: true,
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    // Calculate current paid amount
    const currentPaidAmount = claim.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()),
      0,
    );

    const totalAmount = parseFloat(claim.totalAmount.toString());
    const newPaidAmount = currentPaidAmount + dto.amount;

    if (newPaidAmount > totalAmount) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) would exceed remaining balance. ` +
          `Total: ${totalAmount}, Already paid: ${currentPaidAmount}, Remaining: ${totalAmount - currentPaidAmount}`,
      );
    }

    // Create the payment
    const payment = await this.prisma.payment.create({
      data: {
        claimId,
        amount: new Decimal(dto.amount),
        paymentDate: new Date(dto.paymentDate),
        paymentMethod: dto.paymentMethod,
        reference: dto.reference,
      },
    });

    // Update claim paid amount and status
    const isPaidInFull = newPaidAmount >= totalAmount;
    const isPartialPayment = newPaidAmount > 0 && newPaidAmount < totalAmount;

    await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        paidAmount: new Decimal(newPaidAmount),
        status: isPaidInFull
          ? ClaimStatus.PAID
          : isPartialPayment
            ? ClaimStatus.PARTIAL_PAYMENT
            : claim.status,
      },
    });

    this.logger.log(
      `Payment of ${dto.amount} EUR recorded for claim ${claim.claimNumber}. ` +
        `Total paid: ${newPaidAmount} of ${totalAmount}`,
    );

    return payment;
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: ClaimStatus,
    newStatus: ClaimStatus,
  ): void {
    const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
      [ClaimStatus.DRAFT]: [ClaimStatus.SUBMITTED, ClaimStatus.CANCELLED],
      [ClaimStatus.SUBMITTED]: [
        ClaimStatus.PENDING,
        ClaimStatus.ACCEPTED,
        ClaimStatus.REJECTED,
        ClaimStatus.CANCELLED,
      ],
      [ClaimStatus.PENDING]: [
        ClaimStatus.ACCEPTED,
        ClaimStatus.REJECTED,
        ClaimStatus.CANCELLED,
      ],
      [ClaimStatus.ACCEPTED]: [
        ClaimStatus.PARTIAL_PAYMENT,
        ClaimStatus.PAID,
      ],
      [ClaimStatus.REJECTED]: [ClaimStatus.RESUBMITTED],
      [ClaimStatus.PARTIAL_PAYMENT]: [ClaimStatus.PAID],
      [ClaimStatus.PAID]: [],
      [ClaimStatus.CANCELLED]: [],
      [ClaimStatus.RESUBMITTED]: [
        ClaimStatus.PENDING,
        ClaimStatus.ACCEPTED,
        ClaimStatus.REJECTED,
      ],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
          `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Format claim response with calculated fields
   */
  private formatClaimResponse(claim: any): any {
    const totalAmount = parseFloat(claim.totalAmount?.toString() || '0');
    const paidAmount = parseFloat(claim.paidAmount?.toString() || '0');
    const remainingBalance = totalAmount - paidAmount;

    return {
      ...claim,
      totalAmount,
      paidAmount: paidAmount || undefined,
      remainingBalance: remainingBalance > 0 ? remainingBalance : undefined,
    };
  }
}
