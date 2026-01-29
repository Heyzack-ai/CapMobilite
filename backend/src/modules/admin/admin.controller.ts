import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminUsersQueryDto,
  AuditLogsQueryDto,
  DashboardStatsResponseDto,
} from './dto';
import { Roles } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics', type: DashboardStatsResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied - staff only' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @Roles(UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'List all users (compliance admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Access denied - compliance admin only' })
  async listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('audit')
  @Roles(UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Search audit logs (compliance admin only)' })
  @ApiResponse({ status: 200, description: 'Audit log entries' })
  @ApiResponse({ status: 403, description: 'Access denied - compliance admin only' })
  async searchAuditLogs(@Query() query: AuditLogsQueryDto) {
    return this.adminService.searchAuditLogs(query);
  }

  @Get('system/metrics')
  @Roles(UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({ status: 200, description: 'System metrics' })
  @ApiResponse({ status: 403, description: 'Access denied - compliance admin only' })
  async getSystemMetrics() {
    return this.adminService.getSystemMetrics();
  }
}
