import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  TicketStatus,
  TicketSeverity,
  UserRole,
  DeviceStatus,
  VisitOutcome,
} from '@common/enums';
import {
  CreateServiceTicketDto,
  UpdateServiceTicketDto,
  AssignTicketDto,
  CreateVisitDto,
  UpdateVisitDto,
  RecordPartUsageDto,
} from './dto';
import { Prisma } from '@prisma/client';

export interface TicketFilters {
  status?: TicketStatus;
  severity?: TicketSeverity;
  assignedTo?: string;
  deviceId?: string;
  reportedBy?: string;
}

@Injectable()
export class ServiceTicketService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique ticket number in format TKT-YYYY-XXXXX
   */
  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TKT-${year}-`;

    // Find the highest ticket number for this year
    const lastTicket = await this.prisma.serviceTicket.findFirst({
      where: {
        ticketNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        ticketNumber: 'desc',
      },
      select: {
        ticketNumber: true,
      },
    });

    let nextNumber = 1;
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Validate ticket status transitions
   */
  private validateStatusTransition(
    currentStatus: TicketStatus,
    newStatus: TicketStatus,
  ): void {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.ASSIGNED, TicketStatus.CLOSED],
      [TicketStatus.ASSIGNED]: [
        TicketStatus.IN_PROGRESS,
        TicketStatus.OPEN,
        TicketStatus.CLOSED,
      ],
      [TicketStatus.IN_PROGRESS]: [
        TicketStatus.PENDING_PARTS,
        TicketStatus.RESOLVED,
        TicketStatus.ASSIGNED,
      ],
      [TicketStatus.PENDING_PARTS]: [
        TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED,
      ],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CLOSED]: [], // Terminal state
    };

    if (currentStatus === newStatus) {
      return; // No change
    }

    const allowed = validTransitions[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
          `Allowed transitions: ${allowed.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Create a new service ticket
   */
  async create(dto: CreateServiceTicketDto, reporterId: string) {
    // Verify device exists and is not decommissioned
    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: dto.deviceId },
      include: {
        patient: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.status === DeviceStatus.DECOMMISSIONED) {
      throw new BadRequestException(
        'Cannot create ticket for decommissioned device',
      );
    }

    // Verify reporter has access to this device (patient, staff, or technician)
    const reporter = await this.prisma.user.findUnique({
      where: { id: reporterId },
      select: { role: true },
    });

    if (!reporter) {
      throw new NotFoundException('Reporter not found');
    }

    const isPatientOwner = device.patient?.user?.id === reporterId;
    const isStaff = [UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN].includes(
      reporter.role as UserRole,
    );

    if (!isPatientOwner && !isStaff) {
      throw new ForbiddenException(
        'You do not have permission to create tickets for this device',
      );
    }

    const ticketNumber = await this.generateTicketNumber();

    // Determine initial severity based on safety issue
    const severity =
      dto.isSafetyIssue && dto.severity !== TicketSeverity.CRITICAL
        ? TicketSeverity.HIGH
        : dto.severity;

    const ticket = await this.prisma.serviceTicket.create({
      data: {
        ticketNumber,
        deviceId: dto.deviceId,
        reportedBy: reporterId,
        category: dto.category,
        severity,
        isSafetyIssue: dto.isSafetyIssue ?? false,
        description: dto.description,
        status: TicketStatus.OPEN,
      },
      include: {
        device: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update device status if it's a repair
    if (dto.ticketType === 'REPAIR' || dto.ticketType === 'EMERGENCY') {
      await this.prisma.deviceInstance.update({
        where: { id: dto.deviceId },
        data: { status: DeviceStatus.IN_REPAIR },
      });
    }

    return ticket;
  }

  /**
   * Get a ticket by ID
   */
  async findOne(id: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id },
      include: {
        device: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        technicianVisits: {
          include: {
            technician: {
              select: {
                id: true,
                email: true,
              },
            },
            partUsages: true,
          },
          orderBy: { scheduledAt: 'desc' },
        },
        partUsages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    return ticket;
  }

  /**
   * List tickets with filters and pagination
   */
  async findAll(
    filters: TicketFilters,
    cursor?: string,
    limit: number = 20,
  ) {
    const where: Prisma.ServiceTicketWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.severity) {
      where.severity = filters.severity;
    }
    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }
    if (filters.deviceId) {
      where.deviceId = filters.deviceId;
    }
    if (filters.reportedBy) {
      where.reportedBy = filters.reportedBy;
    }

    const tickets = await this.prisma.serviceTicket.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      include: {
        device: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const hasMore = tickets.length > limit;
    const data = hasMore ? tickets.slice(0, -1) : tickets;
    const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

    return {
      data,
      pagination: {
        cursor: nextCursor,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Update a ticket
   */
  async update(id: string, dto: UpdateServiceTicketDto, userId: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        assignedTo: true,
        reportedBy: true,
        deviceId: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    // Validate status transition if status is being updated
    if (dto.status) {
      this.validateStatusTransition(ticket.status as TicketStatus, dto.status);
    }

    const updatedTicket = await this.prisma.serviceTicket.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.severity && { severity: dto.severity }),
        ...(dto.status && { status: dto.status }),
        ...(dto.description && { description: dto.description }),
        ...(dto.isSafetyIssue !== undefined && {
          isSafetyIssue: dto.isSafetyIssue,
        }),
        ...(dto.resolutionNotes && { resolutionNotes: dto.resolutionNotes }),
        ...(dto.status === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
      },
      include: {
        device: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Update device status based on ticket status
    if (dto.status === TicketStatus.CLOSED || dto.status === TicketStatus.RESOLVED) {
      // Check if there are other open tickets for this device
      const otherOpenTickets = await this.prisma.serviceTicket.count({
        where: {
          deviceId: ticket.deviceId,
          id: { not: id },
          status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
        },
      });

      if (otherOpenTickets === 0) {
        await this.prisma.deviceInstance.update({
          where: { id: ticket.deviceId },
          data: { status: DeviceStatus.ACTIVE },
        });
      }
    }

    return updatedTicket;
  }

  /**
   * Assign a ticket to a technician
   */
  async assign(id: string, dto: AssignTicketDto, assignerId: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    // Verify the assignee is a technician
    const technician = await this.prisma.user.findUnique({
      where: { id: dto.technicianId },
      select: { id: true, role: true, status: true },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    if (technician.role !== UserRole.TECHNICIAN) {
      throw new BadRequestException('Assignee must be a technician');
    }

    if (technician.status !== 'ACTIVE') {
      throw new BadRequestException('Technician account is not active');
    }

    const updatedTicket = await this.prisma.serviceTicket.update({
      where: { id },
      data: {
        assignedTo: dto.technicianId,
        status:
          ticket.status === TicketStatus.OPEN
            ? TicketStatus.ASSIGNED
            : ticket.status,
      },
      include: {
        device: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return updatedTicket;
  }

  /**
   * Close a ticket
   */
  async close(id: string, resolutionNotes: string, userId: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id },
      select: { id: true, status: true, deviceId: true },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    // Can only close from RESOLVED status
    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException(
        'Ticket must be resolved before it can be closed',
      );
    }

    const closedTicket = await this.prisma.serviceTicket.update({
      where: { id },
      data: {
        status: TicketStatus.CLOSED,
        resolutionNotes,
      },
      include: {
        device: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Update device status
    const otherOpenTickets = await this.prisma.serviceTicket.count({
      where: {
        deviceId: ticket.deviceId,
        id: { not: id },
        status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
      },
    });

    if (otherOpenTickets === 0) {
      await this.prisma.deviceInstance.update({
        where: { id: ticket.deviceId },
        data: { status: DeviceStatus.ACTIVE },
      });
    }

    return closedTicket;
  }

  // =========================================================================
  // Visit Management
  // =========================================================================

  /**
   * Schedule a technician visit
   */
  async createVisit(ticketId: string, dto: CreateVisitDto, schedulerId: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, status: true, assignedTo: true },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Cannot schedule visit for closed ticket');
    }

    // Use provided technician or default to assigned technician
    const technicianId = dto.technicianId || ticket.assignedTo;

    if (!technicianId) {
      throw new BadRequestException(
        'No technician assigned. Please specify a technician ID or assign the ticket first.',
      );
    }

    // Verify technician exists
    const technician = await this.prisma.user.findUnique({
      where: { id: technicianId },
      select: { id: true, role: true },
    });

    if (!technician || technician.role !== UserRole.TECHNICIAN) {
      throw new BadRequestException('Invalid technician');
    }

    const visit = await this.prisma.technicianVisit.create({
      data: {
        ticketId,
        technicianId,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
      },
      include: {
        technician: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Update ticket status to IN_PROGRESS if it was ASSIGNED
    if (ticket.status === TicketStatus.ASSIGNED) {
      await this.prisma.serviceTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    return visit;
  }

  /**
   * Get all visits for a ticket
   */
  async getVisits(ticketId: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    const visits = await this.prisma.technicianVisit.findMany({
      where: { ticketId },
      include: {
        technician: {
          select: {
            id: true,
            email: true,
          },
        },
        partUsages: true,
        signatureImage: {
          select: {
            id: true,
            filename: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return visits;
  }

  /**
   * Update a visit
   */
  async updateVisit(
    ticketId: string,
    visitId: string,
    dto: UpdateVisitDto,
    userId: string,
  ) {
    const visit = await this.prisma.technicianVisit.findFirst({
      where: {
        id: visitId,
        ticketId,
      },
      include: {
        ticket: {
          select: { id: true, status: true },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const updatedVisit = await this.prisma.technicianVisit.update({
      where: { id: visitId },
      data: {
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.arrivedAt && { arrivedAt: new Date(dto.arrivedAt) }),
        ...(dto.completedAt && { completedAt: new Date(dto.completedAt) }),
        ...(dto.outcome && { outcome: dto.outcome }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.signatureImageId && { signatureImageId: dto.signatureImageId }),
      },
      include: {
        technician: {
          select: {
            id: true,
            email: true,
          },
        },
        partUsages: true,
      },
    });

    // Update ticket status based on visit outcome
    if (dto.outcome) {
      let newStatus: TicketStatus | null = null;

      switch (dto.outcome) {
        case VisitOutcome.COMPLETED:
          newStatus = TicketStatus.RESOLVED;
          break;
        case VisitOutcome.PARTS_NEEDED:
          newStatus = TicketStatus.PENDING_PARTS;
          break;
        case VisitOutcome.RESCHEDULED:
          newStatus = TicketStatus.IN_PROGRESS;
          break;
      }

      if (newStatus) {
        await this.prisma.serviceTicket.update({
          where: { id: ticketId },
          data: {
            status: newStatus,
            ...(newStatus === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
          },
        });
      }
    }

    return updatedVisit;
  }

  // =========================================================================
  // Parts Usage Tracking
  // =========================================================================

  /**
   * Record parts used during a visit
   */
  async recordPartUsage(
    ticketId: string,
    visitId: string,
    dto: RecordPartUsageDto,
    userId: string,
  ) {
    // Verify visit exists and belongs to ticket
    const visit = await this.prisma.technicianVisit.findFirst({
      where: {
        id: visitId,
        ticketId,
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const partUsage = await this.prisma.partUsage.create({
      data: {
        ticketId,
        visitId,
        partSku: dto.partSku,
        partName: dto.partName,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
      },
    });

    return partUsage;
  }

  /**
   * Get all parts used for a ticket
   */
  async getPartsUsage(ticketId: string) {
    const ticket = await this.prisma.serviceTicket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      throw new NotFoundException('Service ticket not found');
    }

    const parts = await this.prisma.partUsage.findMany({
      where: { ticketId },
      include: {
        visit: {
          select: {
            id: true,
            scheduledAt: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total cost
    const totalCost = parts.reduce(
      (sum, part) => sum + Number(part.unitCost) * part.quantity,
      0,
    );

    return {
      parts,
      totalCost,
      totalItems: parts.reduce((sum, part) => sum + part.quantity, 0),
    };
  }
}
