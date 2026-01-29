import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { comparePassword } from '@common/utils';
import { UpdatePatientProfileDto, UpdateNirDto, UpdateNotificationPreferencesDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: true,
        createdAt: true,
        patientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            address: true,
            contactPreference: true,
            emergencyContact: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        prescriberProfile: {
          select: {
            id: true,
            rppsNumber: true,
            adeliNumber: true,
            specialty: true,
            practiceName: true,
            practiceAddress: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        staffProfile: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            permissions: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updatePatientProfile(userId: string, dto: UpdatePatientProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.patientProfile) {
      throw new BadRequestException('User does not have a patient profile');
    }

    const updatedProfile = await this.prisma.patientProfile.update({
      where: { id: user.patientProfile.id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.address && { address: dto.address as Prisma.InputJsonValue }),
        ...(dto.contactPreference && { contactPreference: dto.contactPreference }),
        ...(dto.emergencyContact && { emergencyContact: dto.emergencyContact as Prisma.InputJsonValue }),
      },
    });

    return updatedProfile;
  }

  async updateNir(userId: string, dto: UpdateNirDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.patientProfile) {
      throw new BadRequestException('User does not have a patient profile');
    }

    // Verify password
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid password');
    }

    const updatedProfile = await this.prisma.patientProfile.update({
      where: { id: user.patientProfile.id },
      data: {
        ...(dto.nir !== undefined && { nir: dto.nir }),
        ...(dto.carteVitaleNumber !== undefined && {
          carteVitaleNumber: dto.carteVitaleNumber,
        }),
      },
    });

    return {
      message: 'Sensitive information updated successfully',
      nirUpdated: dto.nir !== undefined,
      carteVitaleUpdated: dto.carteVitaleNumber !== undefined,
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // =========================================================================
  // Notification Preferences
  // =========================================================================

  private readonly defaultPreferences = {
    emailEnabled: true,
    smsEnabled: true,
    caseUpdates: true,
    quoteNotifications: true,
    deliveryAlerts: true,
    maintenanceReminders: true,
    marketingEmails: false,
  };

  async getNotificationPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get or create notification preferences
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return defaults if not yet customized
      return this.defaultPreferences;
    }

    return {
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
      caseUpdates: preferences.caseUpdates,
      quoteNotifications: preferences.quoteNotifications,
      deliveryAlerts: preferences.deliveryAlerts,
      maintenanceReminders: preferences.maintenanceReminders,
      marketingEmails: preferences.marketingEmails,
    };
  }

  async updateNotificationPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upsert notification preferences
    const preferences = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailEnabled: dto.emailEnabled ?? this.defaultPreferences.emailEnabled,
        smsEnabled: dto.smsEnabled ?? this.defaultPreferences.smsEnabled,
        caseUpdates: dto.caseUpdates ?? this.defaultPreferences.caseUpdates,
        quoteNotifications: dto.quoteNotifications ?? this.defaultPreferences.quoteNotifications,
        deliveryAlerts: dto.deliveryAlerts ?? this.defaultPreferences.deliveryAlerts,
        maintenanceReminders: dto.maintenanceReminders ?? this.defaultPreferences.maintenanceReminders,
        marketingEmails: dto.marketingEmails ?? this.defaultPreferences.marketingEmails,
      },
      update: {
        ...(dto.emailEnabled !== undefined && { emailEnabled: dto.emailEnabled }),
        ...(dto.smsEnabled !== undefined && { smsEnabled: dto.smsEnabled }),
        ...(dto.caseUpdates !== undefined && { caseUpdates: dto.caseUpdates }),
        ...(dto.quoteNotifications !== undefined && { quoteNotifications: dto.quoteNotifications }),
        ...(dto.deliveryAlerts !== undefined && { deliveryAlerts: dto.deliveryAlerts }),
        ...(dto.maintenanceReminders !== undefined && { maintenanceReminders: dto.maintenanceReminders }),
        ...(dto.marketingEmails !== undefined && { marketingEmails: dto.marketingEmails }),
      },
    });

    return {
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
      caseUpdates: preferences.caseUpdates,
      quoteNotifications: preferences.quoteNotifications,
      deliveryAlerts: preferences.deliveryAlerts,
      maintenanceReminders: preferences.maintenanceReminders,
      marketingEmails: preferences.marketingEmails,
    };
  }

  // =========================================================================
  // User Devices (login sessions)
  // =========================================================================

  async getUserDevices(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
      total: sessions.length,
    };
  }

  async revokeDevice(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Device session revoked' };
  }

  // =========================================================================
  // User Tickets
  // =========================================================================

  async getUserTickets(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.patientProfile) {
      return { data: [], total: 0 };
    }

    // Get device instances for the user's patient profile, then get their tickets
    const devices = await this.prisma.deviceInstance.findMany({
      where: { patientId: user.patientProfile.id },
      select: { id: true },
    });

    const deviceIds = devices.map((d) => d.id);

    if (deviceIds.length === 0) {
      return { data: [], total: 0 };
    }

    const tickets = await this.prisma.serviceTicket.findMany({
      where: { deviceId: { in: deviceIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        device: {
          select: { id: true, serialNumber: true },
        },
      },
    });

    return {
      data: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        category: t.category,
        status: t.status,
        severity: t.severity,
        description: t.description,
        device: t.device,
        createdAt: t.createdAt,
        resolvedAt: t.resolvedAt,
      })),
      total: tickets.length,
    };
  }
}
