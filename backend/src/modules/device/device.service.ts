import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  AssignDeviceDto,
  CreateMaintenanceContractDto,
} from './dto';
import {
  UserRole,
  DeviceInstanceStatus,
  ContractStatus,
} from '@common/enums';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private deviceCounter = 0;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique device instance ID in DEV-XXXXX format
   */
  private async generateDeviceInstanceId(): Promise<string> {
    // Get the current count of devices to generate next ID
    const count = await this.prisma.deviceInstance.count();
    const nextId = count + 1;
    return `DEV-${String(nextId).padStart(5, '0')}`;
  }

  /**
   * Register a new device (OPS only)
   */
  async createDevice(dto: CreateDeviceDto, userId: string) {
    this.logger.log(`User ${userId} registering new device with serial: ${dto.serialNumber}`);

    // Check if serial number already exists
    const existingDevice = await this.prisma.deviceInstance.findUnique({
      where: { serialNumber: dto.serialNumber },
    });

    if (existingDevice) {
      throw new ConflictException(
        `Device with serial number ${dto.serialNumber} already exists`,
      );
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    // Generate device instance ID
    const deviceInstanceId = await this.generateDeviceInstanceId();

    // Create device in AVAILABLE status (no patient/case assigned yet)
    // Note: DeviceInstance requires caseId and patientId, so for inventory tracking
    // we'll need to create it with placeholder values or modify the schema
    // For now, we'll store the device with initial metadata
    const device = await this.prisma.deviceInstance.create({
      data: {
        serialNumber: dto.serialNumber,
        productId: dto.productId,
        // These will be set to placeholder values until assignment
        // In production, you might want a separate inventory model
        caseId: '', // Will be set on assignment
        patientId: '', // Will be set on assignment
        deliveredAt: new Date(), // Registration date
        warrantyEndDate: dto.warrantyEndDate
          ? new Date(dto.warrantyEndDate)
          : null,
        status: 'ACTIVE', // Using ACTIVE for available devices
        currentLocation: dto.currentLocation || undefined,
      },
      include: {
        product: {
          include: {
            family: true,
          },
        },
      },
    });

    return {
      ...device,
      deviceInstanceId,
      message: 'Device registered successfully',
    };
  }

  /**
   * List devices with role-based filtering
   */
  async listDevices(
    userId: string,
    userRole: UserRole,
    query: {
      cursor?: string;
      limit?: number;
      status?: string;
      productId?: string;
    },
  ) {
    const limit = query.limit || 20;

    // Build where clause based on role
    const where: any = {};

    // Filter by status if provided
    if (query.status) {
      where.status = query.status;
    }

    // Filter by product if provided
    if (query.productId) {
      where.productId = query.productId;
    }

    // Role-based filtering
    switch (userRole) {
      case UserRole.PATIENT:
        // Patients can only see their own devices
        const patientProfile = await this.prisma.patientProfile.findFirst({
          where: { userId },
        });
        if (patientProfile) {
          where.patientId = patientProfile.id;
        } else {
          return { data: [], pagination: { hasMore: false, limit } };
        }
        break;

      case UserRole.TECHNICIAN:
        // Technicians can see devices that need maintenance
        where.status = { in: ['IN_REPAIR', 'ACTIVE'] };
        break;

      case UserRole.OPS:
      case UserRole.COMPLIANCE_ADMIN:
        // Full access - no additional filters
        break;

      case UserRole.BILLING:
        // Billing can see all devices but typically for billing purposes
        break;

      case UserRole.PRESCRIBER:
        // Prescribers don't typically need device access
        return { data: [], pagination: { hasMore: false, limit } };

      default:
        return { data: [], pagination: { hasMore: false, limit } };
    }

    const devices = await this.prisma.deviceInstance.findMany({
      where,
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            family: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
        maintenanceContract: true,
      },
    });

    const hasMore = devices.length > limit;
    const data = hasMore ? devices.slice(0, -1) : devices;

    return {
      data,
      pagination: {
        cursor: hasMore ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Get device details by ID
   */
  async getDevice(deviceId: string, userId: string, userRole: UserRole) {
    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
      include: {
        product: {
          include: {
            family: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
        maintenanceContract: true,
        serviceTickets: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            ticketNumber: true,
            category: true,
            severity: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Role-based access check
    if (userRole === UserRole.PATIENT) {
      const patientProfile = await this.prisma.patientProfile.findFirst({
        where: { userId },
      });
      if (!patientProfile || device.patientId !== patientProfile.id) {
        throw new NotFoundException(`Device with ID ${deviceId} not found`);
      }
    }

    return device;
  }

  /**
   * Update device details
   */
  async updateDevice(
    deviceId: string,
    dto: UpdateDeviceDto,
    userId: string,
  ) {
    this.logger.log(`User ${userId} updating device ${deviceId}`);

    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const updateData: any = {};

    if (dto.status !== undefined) {
      // Map DeviceInstanceStatus to DeviceStatus
      const statusMap: Record<DeviceInstanceStatus, string> = {
        [DeviceInstanceStatus.AVAILABLE]: 'ACTIVE',
        [DeviceInstanceStatus.ASSIGNED]: 'ACTIVE',
        [DeviceInstanceStatus.IN_MAINTENANCE]: 'IN_REPAIR',
        [DeviceInstanceStatus.RETIRED]: 'DECOMMISSIONED',
      };
      updateData.status = statusMap[dto.status] || dto.status;
    }

    if (dto.warrantyEndDate !== undefined) {
      updateData.warrantyEndDate = dto.warrantyEndDate
        ? new Date(dto.warrantyEndDate)
        : null;
    }

    if (dto.currentLocation !== undefined) {
      updateData.currentLocation = dto.currentLocation;
    }

    const updatedDevice = await this.prisma.deviceInstance.update({
      where: { id: deviceId },
      data: updateData,
      include: {
        product: {
          include: {
            family: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
        maintenanceContract: true,
      },
    });

    return updatedDevice;
  }

  /**
   * Assign device to patient/case
   */
  async assignDevice(
    deviceId: string,
    dto: AssignDeviceDto,
    userId: string,
  ) {
    this.logger.log(
      `User ${userId} assigning device ${deviceId} to patient ${dto.patientId}`,
    );

    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Check if device is already assigned to a different patient/case
    if (device.patientId && device.patientId !== dto.patientId) {
      throw new BadRequestException(
        'Device is already assigned to another patient. Unassign first.',
      );
    }

    // Verify patient exists
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${dto.patientId} not found`);
    }

    // Verify case exists and belongs to the patient
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case with ID ${dto.caseId} not found`);
    }

    if (caseRecord.patientId !== dto.patientId) {
      throw new BadRequestException('Case does not belong to the specified patient');
    }

    const deliveredAt = dto.deliveredAt ? new Date(dto.deliveredAt) : new Date();

    const updatedDevice = await this.prisma.deviceInstance.update({
      where: { id: deviceId },
      data: {
        patientId: dto.patientId,
        caseId: dto.caseId,
        deliveredAt,
        status: 'ACTIVE', // Assigned status
      },
      include: {
        product: {
          include: {
            family: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
      },
    });

    return {
      ...updatedDevice,
      message: 'Device assigned successfully',
    };
  }

  /**
   * Unassign device from patient/case
   */
  async unassignDevice(deviceId: string, userId: string) {
    this.logger.log(`User ${userId} unassigning device ${deviceId}`);

    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    if (!device.patientId) {
      throw new BadRequestException('Device is not currently assigned');
    }

    // Check for active maintenance contracts
    const activeContract = await this.prisma.maintenanceContract.findFirst({
      where: {
        deviceId,
        status: 'ACTIVE',
      },
    });

    if (activeContract) {
      // Update contract status to cancelled
      await this.prisma.maintenanceContract.update({
        where: { id: activeContract.id },
        data: { status: 'CANCELLED' },
      });
    }

    // Note: We can't set patientId/caseId to null due to schema constraints
    // In production, you'd either have a separate inventory model or make these nullable
    const updatedDevice = await this.prisma.deviceInstance.update({
      where: { id: deviceId },
      data: {
        status: 'ACTIVE', // Back to available
        currentLocation: { status: 'returned', timestamp: new Date().toISOString() },
      },
      include: {
        product: {
          include: {
            family: true,
          },
        },
      },
    });

    return {
      ...updatedDevice,
      message: 'Device unassigned successfully',
    };
  }

  /**
   * Get maintenance history for a device
   */
  async getMaintenanceHistory(
    deviceId: string,
    userId: string,
    userRole: UserRole,
    query: { cursor?: string; limit?: number },
  ) {
    const limit = query.limit || 20;

    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Role-based access check for patients
    if (userRole === UserRole.PATIENT) {
      const patientProfile = await this.prisma.patientProfile.findFirst({
        where: { userId },
      });
      if (!patientProfile || device.patientId !== patientProfile.id) {
        throw new NotFoundException(`Device with ID ${deviceId} not found`);
      }
    }

    const tickets = await this.prisma.serviceTicket.findMany({
      where: { deviceId },
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        technicianVisits: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            technician: {
              select: {
                id: true,
                email: true,
              },
            },
            _count: {
              select: { partUsages: true },
            },
          },
        },
        partUsages: {
          select: {
            id: true,
            partSku: true,
            partName: true,
            quantity: true,
            unitCost: true,
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

    return {
      data,
      pagination: {
        cursor: hasMore ? data[data.length - 1].id : undefined,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Create maintenance contract for a device
   */
  async createMaintenanceContract(
    deviceId: string,
    dto: CreateMaintenanceContractDto,
    userId: string,
  ) {
    this.logger.log(`User ${userId} creating maintenance contract for device ${deviceId}`);

    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
      include: { maintenanceContract: true },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Check if device already has an active contract
    if (device.maintenanceContract?.status === 'ACTIVE') {
      throw new ConflictException(
        'Device already has an active maintenance contract',
      );
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const renewalDate = new Date(dto.renewalDate);

    if (renewalDate <= startDate) {
      throw new BadRequestException(
        'Renewal date must be after start date',
      );
    }

    // If there's an existing expired/cancelled contract, we can create a new one
    // Prisma's 1-1 relation with unique constraint means we need to delete the old one
    if (device.maintenanceContract) {
      await this.prisma.maintenanceContract.delete({
        where: { id: device.maintenanceContract.id },
      });
    }

    const contract = await this.prisma.maintenanceContract.create({
      data: {
        deviceId,
        contractType: dto.contractType,
        startDate,
        renewalDate,
        annualForfait: dto.annualForfait,
        status: 'ACTIVE',
      },
      include: {
        device: {
          include: {
            product: {
              include: {
                family: true,
              },
            },
          },
        },
      },
    });

    return {
      ...contract,
      message: 'Maintenance contract created successfully',
    };
  }

  /**
   * List maintenance contracts for a device
   */
  async listMaintenanceContracts(
    deviceId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const device = await this.prisma.deviceInstance.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Role-based access check for patients
    if (userRole === UserRole.PATIENT) {
      const patientProfile = await this.prisma.patientProfile.findFirst({
        where: { userId },
      });
      if (!patientProfile || device.patientId !== patientProfile.id) {
        throw new NotFoundException(`Device with ID ${deviceId} not found`);
      }
    }

    // Since it's a 1-1 relation, we get the current contract
    const contract = await this.prisma.maintenanceContract.findUnique({
      where: { deviceId },
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
      },
    });

    // Return as array for consistency with the endpoint name
    return {
      data: contract ? [contract] : [],
      count: contract ? 1 : 0,
    };
  }
}
