import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@prisma/client';
import { QuoteStatus, UserRole, CaseStatus } from '@common/enums';
import { CreateQuoteDto, UpdateQuoteDto, CreateLineItemDto, RejectQuoteDto } from './dto';
import { PaginationQueryDto } from '@common/dto';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);
  private readonly DEFAULT_VALIDITY_DAYS = 30;

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new quote for a case
   */
  async createQuote(
    dto: CreateQuoteDto,
    creatorId: string,
    userRole: UserRole,
  ) {
    // Only OPS can create quotes
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException('Only OPS staff can create quotes');
    }

    // Verify case exists and is in valid status
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
      include: {
        patient: true,
        quotes: {
          where: {
            status: {
              in: [QuoteStatus.DRAFT, QuoteStatus.PENDING_APPROVAL],
            },
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Check if there's already an active quote
    if (caseRecord.quotes.length > 0) {
      throw new BadRequestException(
        'Case already has an active quote. Please supersede the existing quote first.',
      );
    }

    // Generate quote number: QT-YYYY-XXXXX
    const quoteNumber = await this.generateQuoteNumber();

    // Create the quote
    const quote = await this.prisma.quote.create({
      data: {
        caseId: dto.caseId,
        quoteNumber,
        version: 1,
        totalAmount: 0,
        lpprCoverage: 0,
        patientRemainder: 0,
        status: QuoteStatus.DRAFT,
        createdBy: creatorId,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
      },
    });

    this.logger.log(`Quote ${quoteNumber} created for case ${caseRecord.caseNumber}`);

    return this.formatQuoteResponse(quote);
  }

  /**
   * Get quote by ID
   */
  async getQuote(quoteId: string, userId: string, userRole: UserRole) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
            lpprItem: {
              select: {
                id: true,
                code: true,
                label: true,
                maxPrice: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
            patientId: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Check access permissions
    if (!this.canAccessQuote(quote, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatQuoteResponse(quote);
  }

  /**
   * List quotes with optional filters
   */
  async listQuotes(
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto & {
      caseId?: string;
      status?: QuoteStatus;
    },
  ) {
    const where: Prisma.QuoteWhereInput = {};

    // Filter by case if specified
    if (query.caseId) {
      where.caseId = query.caseId;
    }

    // Filter by status if specified
    if (query.status) {
      where.status = query.status;
    }

    // Patients can only see their own quotes
    if (userRole === UserRole.PATIENT) {
      where.case = {
        patient: {
          userId: userId,
        },
      };
    }

    const limit = query.limit || 20;

    const quotes = await this.prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
        lineItems: {
          select: {
            id: true,
          },
        },
      },
    });

    const hasMore = quotes.length > limit;
    const data = hasMore ? quotes.slice(0, -1) : quotes;

    return {
      data: data.map((q) => this.formatQuoteResponse(q)),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Update quote details (only in DRAFT status)
   */
  async updateQuote(
    quoteId: string,
    dto: UpdateQuoteDto,
    userId: string,
    userRole: UserRole,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Only OPS can update quotes
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException('Only OPS staff can update quotes');
    }

    // Can only update DRAFT quotes
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Can only update quotes in DRAFT status');
    }

    // Update quote - for now we store notes in case notes since Quote model doesn't have notes field
    // The validityDays would be used when submitting
    const updatedQuote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: {
          include: {
            product: {
              select: { id: true, sku: true, name: true },
            },
            lpprItem: {
              select: { id: true, code: true, label: true, maxPrice: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        case: {
          select: { id: true, caseNumber: true, status: true },
        },
      },
    });

    this.logger.log(`Quote ${quote.quoteNumber} updated`);

    return this.formatQuoteResponse(updatedQuote!);
  }

  /**
   * Add a line item to the quote
   */
  async addLineItem(
    quoteId: string,
    dto: CreateLineItemDto,
    userId: string,
    userRole: UserRole,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Only OPS can add line items
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException('Only OPS staff can add line items');
    }

    // Can only modify DRAFT quotes
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Can only add items to quotes in DRAFT status');
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify LPPR item exists
    const lpprItem = await this.prisma.lPPRItem.findUnique({
      where: { id: dto.lpprItemId },
    });

    if (!lpprItem) {
      throw new NotFoundException('LPPR item not found');
    }

    // Calculate line total
    const lineTotal = dto.quantity * dto.unitPrice;

    // Determine sort order
    const sortOrder = dto.sortOrder ?? quote.lineItems.length;

    // Create line item
    const lineItem = await this.prisma.quoteLineItem.create({
      data: {
        quoteId,
        productId: dto.productId,
        lpprItemId: dto.lpprItemId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        lineTotal,
        sortOrder,
      },
      include: {
        product: {
          select: { id: true, sku: true, name: true },
        },
        lpprItem: {
          select: { id: true, code: true, label: true, maxPrice: true },
        },
      },
    });

    // Recalculate quote totals
    await this.recalculateQuoteTotals(quoteId);

    this.logger.log(`Line item added to quote ${quote.quoteNumber}`);

    return this.formatLineItemResponse(lineItem);
  }

  /**
   * Remove a line item from the quote
   */
  async removeLineItem(
    quoteId: string,
    itemId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Only OPS can remove line items
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException('Only OPS staff can remove line items');
    }

    // Can only modify DRAFT quotes
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Can only remove items from quotes in DRAFT status');
    }

    // Verify line item exists and belongs to quote
    const lineItem = await this.prisma.quoteLineItem.findFirst({
      where: {
        id: itemId,
        quoteId,
      },
    });

    if (!lineItem) {
      throw new NotFoundException('Line item not found');
    }

    // Delete line item
    await this.prisma.quoteLineItem.delete({
      where: { id: itemId },
    });

    // Recalculate quote totals
    await this.recalculateQuoteTotals(quoteId);

    this.logger.log(`Line item removed from quote ${quote.quoteNumber}`);

    return { success: true };
  }

  /**
   * Submit quote to patient for approval
   */
  async submitQuote(quoteId: string, userId: string, userRole: UserRole) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: true,
        case: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Only OPS can submit quotes
    if (userRole !== UserRole.OPS && userRole !== UserRole.COMPLIANCE_ADMIN) {
      throw new ForbiddenException('Only OPS staff can submit quotes');
    }

    // Can only submit DRAFT quotes
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Can only submit quotes in DRAFT status');
    }

    // Must have at least one line item
    if (quote.lineItems.length === 0) {
      throw new BadRequestException('Quote must have at least one line item');
    }

    // Update quote status
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.PENDING_APPROVAL,
      },
      include: {
        lineItems: {
          include: {
            product: {
              select: { id: true, sku: true, name: true },
            },
            lpprItem: {
              select: { id: true, code: true, label: true, maxPrice: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        case: {
          select: { id: true, caseNumber: true, status: true },
        },
      },
    });

    // Update case status
    await this.prisma.case.update({
      where: { id: quote.caseId },
      data: {
        status: CaseStatus.PATIENT_APPROVAL_PENDING,
      },
    });

    this.logger.log(`Quote ${quote.quoteNumber} submitted for approval`);

    // TODO: Send notification to patient

    return this.formatQuoteResponse(updatedQuote);
  }

  /**
   * Patient approves the quote
   */
  async approveQuote(quoteId: string, userId: string, userRole: UserRole) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        case: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Check if user can approve (patient who owns the case or staff)
    const isPatientOwner = quote.case.patient.userId === userId;
    const isStaff = [UserRole.OPS, UserRole.COMPLIANCE_ADMIN].includes(userRole);

    if (!isPatientOwner && !isStaff) {
      throw new ForbiddenException('Only the patient or authorized staff can approve this quote');
    }

    // Can only approve PENDING_APPROVAL quotes
    if (quote.status !== QuoteStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only approve quotes pending approval');
    }

    // Check for expiration (30 days from creation)
    const expirationDate = new Date(quote.createdAt);
    expirationDate.setDate(expirationDate.getDate() + this.DEFAULT_VALIDITY_DAYS);

    if (new Date() > expirationDate) {
      // Mark as expired
      await this.prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: QuoteStatus.SUPERSEDED,
        },
      });
      throw new BadRequestException('Quote has expired. Please request a new quote.');
    }

    // Update quote
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: userId,
      },
      include: {
        lineItems: {
          include: {
            product: {
              select: { id: true, sku: true, name: true },
            },
            lpprItem: {
              select: { id: true, code: true, label: true, maxPrice: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        case: {
          select: { id: true, caseNumber: true, status: true },
        },
      },
    });

    // Update case status
    await this.prisma.case.update({
      where: { id: quote.caseId },
      data: {
        status: CaseStatus.READY_TO_SUBMIT,
      },
    });

    this.logger.log(`Quote ${quote.quoteNumber} approved by user ${userId}`);

    return this.formatQuoteResponse(updatedQuote);
  }

  /**
   * Patient rejects the quote
   */
  async rejectQuote(
    quoteId: string,
    dto: RejectQuoteDto,
    userId: string,
    userRole: UserRole,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        case: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Check if user can reject (patient who owns the case or staff)
    const isPatientOwner = quote.case.patient.userId === userId;
    const isStaff = [UserRole.OPS, UserRole.COMPLIANCE_ADMIN].includes(userRole);

    if (!isPatientOwner && !isStaff) {
      throw new ForbiddenException('Only the patient or authorized staff can reject this quote');
    }

    // Can only reject PENDING_APPROVAL quotes
    if (quote.status !== QuoteStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only reject quotes pending approval');
    }

    // Update quote
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.REJECTED,
      },
      include: {
        lineItems: {
          include: {
            product: {
              select: { id: true, sku: true, name: true },
            },
            lpprItem: {
              select: { id: true, code: true, label: true, maxPrice: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        case: {
          select: { id: true, caseNumber: true, status: true },
        },
      },
    });

    // Update case status back to quote pending
    await this.prisma.case.update({
      where: { id: quote.caseId },
      data: {
        status: CaseStatus.QUOTE_PENDING,
      },
    });

    // Add rejection reason as case note if provided
    if (dto.reason) {
      await this.prisma.caseNote.create({
        data: {
          caseId: quote.caseId,
          authorId: userId,
          content: `Quote ${quote.quoteNumber} rejected: ${dto.reason}`,
          isInternal: false,
        },
      });
    }

    this.logger.log(`Quote ${quote.quoteNumber} rejected by user ${userId}`);

    return this.formatQuoteResponse(updatedQuote);
  }

  /**
   * Check for expired quotes and update their status
   */
  async processExpiredQuotes() {
    const expirationThreshold = new Date();
    expirationThreshold.setDate(expirationThreshold.getDate() - this.DEFAULT_VALIDITY_DAYS);

    const expiredQuotes = await this.prisma.quote.updateMany({
      where: {
        status: QuoteStatus.PENDING_APPROVAL,
        createdAt: {
          lt: expirationThreshold,
        },
      },
      data: {
        status: QuoteStatus.SUPERSEDED,
      },
    });

    if (expiredQuotes.count > 0) {
      this.logger.log(`Marked ${expiredQuotes.count} quotes as expired`);
    }

    return { expiredCount: expiredQuotes.count };
  }

  /**
   * Generate a unique quote number in format QT-YYYY-XXXXX
   */
  private async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QT-${year}-`;

    // Get the latest quote number for this year
    const latestQuote = await this.prisma.quote.findFirst({
      where: {
        quoteNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        quoteNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (latestQuote) {
      const currentNumber = parseInt(latestQuote.quoteNumber.replace(prefix, ''), 10);
      nextNumber = currentNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Recalculate quote totals from line items
   */
  private async recalculateQuoteTotals(quoteId: string) {
    const lineItems = await this.prisma.quoteLineItem.findMany({
      where: { quoteId },
      include: {
        lpprItem: true,
      },
    });

    let totalAmount = new Prisma.Decimal(0);
    let lpprCoverage = new Prisma.Decimal(0);

    for (const item of lineItems) {
      totalAmount = totalAmount.add(item.lineTotal);

      // Calculate LPPR coverage (minimum of line total and max LPPR price * quantity)
      if (item.lpprItem.maxPrice) {
        const maxCoverage = item.lpprItem.maxPrice.mul(item.quantity);
        const itemCoverage = maxCoverage.lt(item.lineTotal) ? maxCoverage : item.lineTotal;
        lpprCoverage = lpprCoverage.add(itemCoverage);
      }
    }

    const patientRemainder = totalAmount.sub(lpprCoverage);

    await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        totalAmount,
        lpprCoverage,
        patientRemainder,
      },
    });
  }

  /**
   * Check if user can access a quote
   */
  private canAccessQuote(quote: any, userId: string, userRole: UserRole): boolean {
    // Staff roles have full access
    if (
      [
        UserRole.OPS,
        UserRole.BILLING,
        UserRole.COMPLIANCE_ADMIN,
        UserRole.TECHNICIAN,
      ].includes(userRole)
    ) {
      return true;
    }

    // Patient can access their own quotes
    if (userRole === UserRole.PATIENT && quote.case?.patientId) {
      // Need to check if patient owns the case
      return quote.case.patient?.userId === userId;
    }

    // Creator can access
    if (quote.createdBy === userId) {
      return true;
    }

    return false;
  }

  /**
   * Format quote for response
   */
  private formatQuoteResponse(quote: any) {
    const expiresAt = new Date(quote.createdAt);
    expiresAt.setDate(expiresAt.getDate() + this.DEFAULT_VALIDITY_DAYS);

    return {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      caseId: quote.caseId,
      version: quote.version,
      totalAmount: Number(quote.totalAmount),
      lpprCoverage: Number(quote.lpprCoverage),
      patientRemainder: Number(quote.patientRemainder),
      status: quote.status,
      pdfDocumentId: quote.pdfDocumentId,
      approvedAt: quote.approvedAt,
      approvedBy: quote.approvedBy,
      createdAt: quote.createdAt,
      createdBy: quote.createdBy,
      expiresAt,
      lineItems: quote.lineItems?.map((item: any) => this.formatLineItemResponse(item)),
      case: quote.case,
    };
  }

  /**
   * Format line item for response
   */
  private formatLineItemResponse(item: any) {
    return {
      id: item.id,
      productId: item.productId,
      lpprItemId: item.lpprItemId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      sortOrder: item.sortOrder,
      product: item.product,
      lpprItem: item.lpprItem
        ? {
            ...item.lpprItem,
            maxPrice: item.lpprItem.maxPrice ? Number(item.lpprItem.maxPrice) : null,
          }
        : undefined,
    };
  }
}
