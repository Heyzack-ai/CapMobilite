import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { comparePassword } from '@common/utils';
import { UpdatePatientProfileDto, UpdateNirDto } from './dto';

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
        ...(dto.address && { address: dto.address }),
        ...(dto.contactPreference && { contactPreference: dto.contactPreference }),
        ...(dto.emergencyContact && { emergencyContact: dto.emergencyContact }),
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
}
