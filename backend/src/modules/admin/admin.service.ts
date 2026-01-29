import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AdminUsersQueryDto, AuditLogsQueryDto } from './dto';
import { CaseStatus, ClaimStatus, UserRole } from '@common/enums';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Get case statistics
    const [
      totalCases,
      casesByStatus,
      casesThisMonth,
      casesThisWeek,
    ] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.case.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.case.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
    ]);

    // Get claim statistics
    const [
      totalClaims,
      pendingClaims,
      acceptedClaims,
      rejectedClaims,
      pendingAmount,
      acceptedAmount,
    ] = await Promise.all([
      this.prisma.claim.count(),
      this.prisma.claim.count({ where: { status: ClaimStatus.SUBMITTED } }),
      this.prisma.claim.count({ where: { status: ClaimStatus.ACCEPTED } }),
      this.prisma.claim.count({ where: { status: ClaimStatus.REJECTED } }),
      this.prisma.claim.aggregate({
        where: { status: ClaimStatus.SUBMITTED },
        _sum: { totalAmount: true },
      }),
      this.prisma.claim.aggregate({
        where: { status: ClaimStatus.ACCEPTED },
        _sum: { paidAmount: true },
      }),
    ]);

    // Get user statistics
    const [
      totalUsers,
      usersByRole,
      newUsersThisWeek,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
    ]);

    // Get active users today (using lastLoginAt)
    const activeToday = await this.prisma.user.count({
      where: { lastLoginAt: { gte: startOfToday } },
    });

    // Get device instance statistics
    const [totalDevices, maintenanceDue] = await Promise.all([
      this.prisma.deviceInstance.count(),
      this.prisma.maintenanceContract.count({
        where: { renewalDate: { lte: now } },
      }),
    ]);

    // Get service ticket statistics
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
    ] = await Promise.all([
      this.prisma.serviceTicket.count(),
      this.prisma.serviceTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.serviceTicket.count({ where: { status: 'IN_PROGRESS' } }),
    ]);

    // Calculate average resolution time for resolved tickets
    const resolvedTickets = await this.prisma.serviceTicket.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    let avgResolutionDays = 0;
    if (resolvedTickets.length > 0) {
      const totalDays = resolvedTickets.reduce((sum, ticket) => {
        const days = (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgResolutionDays = Math.round(totalDays / resolvedTickets.length * 10) / 10;
    }

    return {
      cases: {
        total: totalCases,
        byStatus: Object.fromEntries(casesByStatus.map((s) => [s.status, s._count.id])),
        thisMonth: casesThisMonth,
        thisWeek: casesThisWeek,
      },
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        accepted: acceptedClaims,
        rejected: rejectedClaims,
        totalAmountPending: pendingAmount._sum?.totalAmount?.toNumber() || 0,
        totalAmountAccepted: acceptedAmount._sum?.paidAmount?.toNumber() || 0,
      },
      users: {
        total: totalUsers,
        byRole: Object.fromEntries(usersByRole.map((u) => [u.role, u._count.id])),
        activeToday,
        newThisWeek: newUsersThisWeek,
      },
      devices: {
        total: totalDevices,
        maintenanceDue,
      },
      serviceTickets: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        avgResolutionDays,
      },
    };
  }

  /**
   * List all users with filters
   */
  async listUsers(query: AdminUsersQueryDto) {
    const { page = 1, limit = 20, role, search, isActive, mfaEnabled } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) where.role = role;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof mfaEnabled === 'boolean') where.mfaEnabled = mfaEnabled;

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          mfaEnabled: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(query: AuditLogsQueryDto) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.actorId = userId;
    if (action) where.action = action;
    if (entityType) where.objectType = entityType;
    if (entityId) where.objectId = entityId;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: { select: { email: true } },
        },
      }),
      this.prisma.auditEvent.count({ where }),
    ]);

    return {
      data: logs.map((log: any) => ({
        id: log.id,
        userId: log.actorId,
        userEmail: log.actor?.email,
        action: log.action,
        entityType: log.objectType,
        entityId: log.objectId,
        changes: log.changes,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.timestamp,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemMetrics() {
    // Database connection check
    let dbConnected = true;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbConnected = false;
    }

    // Get counts for quick health check
    const [userCount, caseCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.case.count(),
    ]);

    return {
      database: {
        connected: dbConnected,
        userCount,
        caseCount,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
