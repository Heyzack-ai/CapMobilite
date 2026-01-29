import { IsOptional, IsString, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, CaseStatus } from '@common/enums';

/**
 * Admin users query
 */
export class AdminUsersQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by role', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Search by email or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by MFA enabled' })
  @IsOptional()
  mfaEnabled?: boolean;
}

/**
 * Audit logs query
 */
export class AuditLogsQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by action type' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Start date filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * Dashboard stats response
 */
export class DashboardStatsResponseDto {
  @ApiProperty({ description: 'Case statistics' })
  cases: {
    total: number;
    byStatus: Record<string, number>;
    thisMonth: number;
    thisWeek: number;
  };

  @ApiProperty({ description: 'Claim statistics' })
  claims: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmountPending: number;
    totalAmountApproved: number;
  };

  @ApiProperty({ description: 'User statistics' })
  users: {
    total: number;
    byRole: Record<string, number>;
    activeToday: number;
    newThisWeek: number;
  };

  @ApiProperty({ description: 'Device statistics' })
  devices: {
    total: number;
    maintenanceDue: number;
    calibrationDue: number;
  };

  @ApiProperty({ description: 'Service ticket statistics' })
  serviceTickets: {
    total: number;
    open: number;
    inProgress: number;
    avgResolutionDays: number;
  };
}

/**
 * Admin user response
 */
export class AdminUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  mfaEnabled: boolean;

  @ApiProperty()
  emailVerified: boolean;

  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

/**
 * Audit log entry response
 */
export class AuditLogEntryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  userEmail?: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entityType: string;

  @ApiPropertyOptional()
  entityId?: string;

  @ApiPropertyOptional()
  oldValue?: any;

  @ApiPropertyOptional()
  newValue?: any;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiProperty()
  createdAt: Date;
}
