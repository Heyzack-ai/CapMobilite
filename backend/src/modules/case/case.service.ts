import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CaseStatus,
  CasePriority,
  TaskStatus,
  UserRole,
} from '@common/enums';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CreateCaseNoteDto,
  CreateCaseTaskDto,
  UpdateCaseTaskDto,
} from './dto';
import { PaginationQueryDto } from '@common/dto';

// Valid status transitions for case workflow
const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.INTAKE_RECEIVED]: [CaseStatus.DOCUMENTS_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.DOCUMENTS_PENDING]: [CaseStatus.DOCUMENTS_COMPLETE, CaseStatus.CANCELLED],
  [CaseStatus.DOCUMENTS_COMPLETE]: [CaseStatus.UNDER_REVIEW, CaseStatus.DOCUMENTS_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.UNDER_REVIEW]: [CaseStatus.QUOTE_PENDING, CaseStatus.DOCUMENTS_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.QUOTE_PENDING]: [CaseStatus.QUOTE_READY, CaseStatus.UNDER_REVIEW, CaseStatus.CANCELLED],
  [CaseStatus.QUOTE_READY]: [CaseStatus.PATIENT_APPROVAL_PENDING, CaseStatus.QUOTE_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.PATIENT_APPROVAL_PENDING]: [CaseStatus.READY_TO_SUBMIT, CaseStatus.QUOTE_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.READY_TO_SUBMIT]: [CaseStatus.SUBMITTED_TO_CPAM, CaseStatus.PATIENT_APPROVAL_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.SUBMITTED_TO_CPAM]: [CaseStatus.CPAM_PENDING, CaseStatus.CANCELLED],
  [CaseStatus.CPAM_PENDING]: [CaseStatus.CPAM_APPROVED, CaseStatus.CPAM_REJECTED, CaseStatus.CANCELLED],
  [CaseStatus.CPAM_APPROVED]: [CaseStatus.DELIVERY_SCHEDULED, CaseStatus.CANCELLED],
  [CaseStatus.CPAM_REJECTED]: [CaseStatus.UNDER_REVIEW, CaseStatus.CANCELLED, CaseStatus.CLOSED],
  [CaseStatus.DELIVERY_SCHEDULED]: [CaseStatus.DELIVERED, CaseStatus.CPAM_APPROVED, CaseStatus.CANCELLED],
  [CaseStatus.DELIVERED]: [CaseStatus.MAINTENANCE_ACTIVE, CaseStatus.CLOSED],
  [CaseStatus.MAINTENANCE_ACTIVE]: [CaseStatus.CLOSED],
  [CaseStatus.CLOSED]: [],
  [CaseStatus.CANCELLED]: [],
};

@Injectable()
export class CaseService {
  private readonly logger = new Logger(CaseService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new case
   */
  async createCase(
    dto: CreateCaseDto,
    userId: string,
    userRole: UserRole,
  ) {
    // Only patients can create cases
    if (userRole !== UserRole.PATIENT) {
      throw new ForbiddenException('Only patients can create cases');
    }

    // Verify the prescription exists and belongs to the patient
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: dto.prescriptionId },
      include: {
        patient: {
          select: { userId: true },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.patient.userId !== userId) {
      throw new ForbiddenException('Prescription does not belong to you');
    }

    // Generate case number
    const caseNumber = await this.generateCaseNumber();

    // Create the case
    const caseRecord = await this.prisma.case.create({
      data: {
        caseNumber,
        patientId: prescription.patientId,
        prescriptionId: dto.prescriptionId,
        status: CaseStatus.INTAKE_RECEIVED,
        priority: dto.priority || CasePriority.NORMAL,
        checklistState: {},
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescription: {
          select: {
            id: true,
            productCategory: true,
            prescriptionDate: true,
          },
        },
      },
    });

    // Create initial note if provided
    if (dto.notes) {
      await this.prisma.caseNote.create({
        data: {
          caseId: caseRecord.id,
          authorId: userId,
          content: dto.notes,
          isInternal: false,
        },
      });
    }

    this.logger.log(`Case ${caseNumber} created for patient ${prescription.patientId}`);

    return this.formatCaseResponse(caseRecord);
  }

  /**
   * List cases with role-based filtering
   */
  async listCases(
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto & { status?: CaseStatus; priority?: CasePriority },
  ) {
    const where: any = {};

    // Role-based filtering
    if (userRole === UserRole.PATIENT) {
      // Patients can only see their own cases
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!patientProfile) {
        return {
          data: [],
          pagination: { cursor: undefined, hasMore: false, limit: query.limit || 20 },
        };
      }

      where.patientId = patientProfile.id;
    } else if (userRole === UserRole.PRESCRIBER) {
      // Prescribers see cases linked to their prescriptions
      const prescriberProfile = await this.prisma.prescriberProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!prescriberProfile) {
        return {
          data: [],
          pagination: { cursor: undefined, hasMore: false, limit: query.limit || 20 },
        };
      }

      where.prescription = { prescriberId: prescriberProfile.id };
    }
    // OPS, BILLING, COMPLIANCE_ADMIN see all cases (no additional filtering)

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Priority filter
    if (query.priority) {
      where.priority = query.priority;
    }

    const limit = query.limit || 20;

    const cases = await this.prisma.case.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescription: {
          select: {
            id: true,
            productCategory: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            notes: true,
            tasks: { where: { status: { not: TaskStatus.COMPLETED } } },
          },
        },
      },
    });

    const hasMore = cases.length > limit;
    const data = hasMore ? cases.slice(0, -1) : cases;

    return {
      data: data.map(this.formatCaseListItem),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Get a single case by ID
   */
  async getCase(caseId: string, userId: string, userRole: UserRole) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { id: true, email: true },
            },
          },
        },
        prescription: {
          select: {
            id: true,
            productCategory: true,
            prescriptionDate: true,
            verificationStatus: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Check access permissions
    if (!this.canAccessCase(caseRecord, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatCaseDetailResponse(caseRecord);
  }

  /**
   * Update a case
   */
  async updateCase(
    caseId: string,
    dto: UpdateCaseDto,
    userId: string,
    userRole: UserRole,
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          select: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Check access permissions
    if (!this.canAccessCase(caseRecord, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    // Patients can only update limited fields
    if (userRole === UserRole.PATIENT) {
      if (dto.status || dto.assignedTo || dto.slaDeadline) {
        throw new ForbiddenException('Patients cannot update these fields');
      }
    }

    // Validate status transition
    if (dto.status && dto.status !== caseRecord.status) {
      const allowedTransitions = STATUS_TRANSITIONS[caseRecord.status];
      if (!allowedTransitions.includes(dto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${caseRecord.status} to ${dto.status}`,
        );
      }

      // Validate rejection reason for CPAM_REJECTED status
      if (dto.status === CaseStatus.CPAM_REJECTED && !dto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required');
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (dto.status) {
      updateData.status = dto.status;

      // Set timestamps based on status
      if (dto.status === CaseStatus.SUBMITTED_TO_CPAM) {
        updateData.submittedAt = new Date();
      } else if (dto.status === CaseStatus.CPAM_APPROVED) {
        updateData.approvedAt = new Date();
      } else if (dto.status === CaseStatus.CPAM_REJECTED) {
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = dto.rejectionReason;
      } else if (dto.status === CaseStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }
    }

    if (dto.priority) {
      updateData.priority = dto.priority;
    }

    if (dto.assignedTo !== undefined) {
      updateData.assignedTo = dto.assignedTo || null;
    }

    if (dto.slaDeadline) {
      updateData.slaDeadline = new Date(dto.slaDeadline);
    }

    const updatedCase = await this.prisma.case.update({
      where: { id: caseId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescription: {
          select: {
            id: true,
            productCategory: true,
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

    this.logger.log(`Case ${caseRecord.caseNumber} updated by user ${userId}`);

    return this.formatCaseResponse(updatedCase);
  }

  /**
   * Add a note to a case
   */
  async addCaseNote(
    caseId: string,
    dto: CreateCaseNoteDto,
    userId: string,
    userRole: UserRole,
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          select: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Check access permissions
    if (!this.canAccessCase(caseRecord, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    // Patients can only create non-internal notes
    const isInternal = userRole === UserRole.PATIENT ? false : (dto.isInternal ?? true);

    const note = await this.prisma.caseNote.create({
      data: {
        caseId,
        authorId: userId,
        content: dto.content,
        isInternal,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    this.logger.log(`Note added to case ${caseRecord.caseNumber} by user ${userId}`);

    return {
      id: note.id,
      content: note.content,
      isInternal: note.isInternal,
      author: {
        id: note.author.id,
        email: note.author.email,
        role: note.author.role,
      },
      createdAt: note.createdAt,
    };
  }

  /**
   * Get notes for a case
   */
  async getCaseNotes(
    caseId: string,
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto,
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          select: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Check access permissions
    if (!this.canAccessCase(caseRecord, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    // Build where clause
    const where: any = { caseId };

    // Patients can only see non-internal notes
    if (userRole === UserRole.PATIENT) {
      where.isInternal = false;
    }

    const limit = query.limit || 20;

    const notes = await this.prisma.caseNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const hasMore = notes.length > limit;
    const data = hasMore ? notes.slice(0, -1) : notes;

    return {
      data: data.map((note) => ({
        id: note.id,
        content: note.content,
        isInternal: note.isInternal,
        author: {
          id: note.author.id,
          email: note.author.email,
          role: note.author.role,
        },
        createdAt: note.createdAt,
      })),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Create a task for a case
   */
  async createCaseTask(
    caseId: string,
    dto: CreateCaseTaskDto,
    userId: string,
    userRole: UserRole,
  ) {
    // Only staff can create tasks
    if (![UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN].includes(userRole)) {
      throw new ForbiddenException('Only staff can create tasks');
    }

    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    const task = await this.prisma.caseTask.create({
      data: {
        caseId,
        taskType: dto.taskType,
        title: dto.title,
        description: dto.description,
        assignedTo: dto.assignedTo,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        status: TaskStatus.PENDING,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Task ${task.id} created for case ${caseRecord.caseNumber}`);

    return this.formatTaskResponse(task);
  }

  /**
   * Get tasks for a case
   */
  async getCaseTasks(
    caseId: string,
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto & { status?: TaskStatus },
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          select: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    // Check access permissions
    if (!this.canAccessCase(caseRecord, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    const where: any = { caseId };

    if (query.status) {
      where.status = query.status;
    }

    const limit = query.limit || 20;

    const tasks = await this.prisma.caseTask.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const hasMore = tasks.length > limit;
    const data = hasMore ? tasks.slice(0, -1) : tasks;

    return {
      data: data.map(this.formatTaskResponse),
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Update a task
   */
  async updateCaseTask(
    caseId: string,
    taskId: string,
    dto: UpdateCaseTaskDto,
    userId: string,
    userRole: UserRole,
  ) {
    // Only staff can update tasks
    if (![UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN].includes(userRole)) {
      throw new ForbiddenException('Only staff can update tasks');
    }

    const task = await this.prisma.caseTask.findFirst({
      where: { id: taskId, caseId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updateData: any = {};

    if (dto.title) {
      updateData.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    if (dto.assignedTo !== undefined) {
      updateData.assignedTo = dto.assignedTo || null;
    }

    if (dto.dueAt !== undefined) {
      updateData.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    }

    const updatedTask = await this.prisma.caseTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Task ${taskId} updated by user ${userId}`);

    return this.formatTaskResponse(updatedTask);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CASE-${year}-`;

    // Get the latest case number for this year
    const latestCase = await this.prisma.case.findFirst({
      where: { caseNumber: { startsWith: prefix } },
      orderBy: { caseNumber: 'desc' },
      select: { caseNumber: true },
    });

    let sequence = 1;
    if (latestCase) {
      const lastSequence = parseInt(latestCase.caseNumber.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  private canAccessCase(caseRecord: any, userId: string, userRole: UserRole): boolean {
    // Staff roles have full access
    if ([UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN].includes(userRole)) {
      return true;
    }

    // Patients can only access their own cases
    if (userRole === UserRole.PATIENT) {
      return caseRecord.patient?.user?.id === userId;
    }

    // Prescribers - would need to check prescription relation
    // For now, allow if they have prescriber role (can be refined)
    if (userRole === UserRole.PRESCRIBER) {
      return true; // This would ideally check if the prescription belongs to them
    }

    return false;
  }

  private formatCaseResponse(caseRecord: any) {
    return {
      id: caseRecord.id,
      caseNumber: caseRecord.caseNumber,
      status: caseRecord.status,
      priority: caseRecord.priority,
      patient: caseRecord.patient
        ? {
            id: caseRecord.patient.id,
            firstName: caseRecord.patient.firstName,
            lastName: caseRecord.patient.lastName,
          }
        : null,
      prescription: caseRecord.prescription
        ? {
            id: caseRecord.prescription.id,
            productCategory: caseRecord.prescription.productCategory,
            prescriptionDate: caseRecord.prescription.prescriptionDate,
          }
        : null,
      assignee: caseRecord.assignee
        ? {
            id: caseRecord.assignee.id,
            email: caseRecord.assignee.email,
          }
        : null,
      slaDeadline: caseRecord.slaDeadline,
      submittedAt: caseRecord.submittedAt,
      approvedAt: caseRecord.approvedAt,
      rejectedAt: caseRecord.rejectedAt,
      rejectionReason: caseRecord.rejectionReason,
      deliveredAt: caseRecord.deliveredAt,
      createdAt: caseRecord.createdAt,
      updatedAt: caseRecord.updatedAt,
    };
  }

  private formatCaseDetailResponse(caseRecord: any) {
    return {
      ...this.formatCaseResponse(caseRecord),
      checklistState: caseRecord.checklistState,
      latestQuote: caseRecord.quotes?.[0]
        ? {
            id: caseRecord.quotes[0].id,
            quoteNumber: caseRecord.quotes[0].quoteNumber,
            status: caseRecord.quotes[0].status,
            totalAmount: caseRecord.quotes[0].totalAmount,
          }
        : null,
    };
  }

  private formatCaseListItem(caseRecord: any) {
    return {
      id: caseRecord.id,
      caseNumber: caseRecord.caseNumber,
      status: caseRecord.status,
      priority: caseRecord.priority,
      patient: caseRecord.patient
        ? {
            id: caseRecord.patient.id,
            firstName: caseRecord.patient.firstName,
            lastName: caseRecord.patient.lastName,
          }
        : null,
      prescription: caseRecord.prescription
        ? {
            id: caseRecord.prescription.id,
            productCategory: caseRecord.prescription.productCategory,
          }
        : null,
      assignee: caseRecord.assignee
        ? {
            id: caseRecord.assignee.id,
            email: caseRecord.assignee.email,
          }
        : null,
      notesCount: caseRecord._count?.notes || 0,
      openTasksCount: caseRecord._count?.tasks || 0,
      createdAt: caseRecord.createdAt,
      updatedAt: caseRecord.updatedAt,
    };
  }

  private formatTaskResponse(task: any) {
    return {
      id: task.id,
      taskType: task.taskType,
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            email: task.assignee.email,
          }
        : null,
      dueAt: task.dueAt,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
    };
  }
}
