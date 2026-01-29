import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';
import { Roles } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Admin - Audit')
@ApiBearerAuth()
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Search audit logs (compliance admin only)' })
  @ApiResponse({ status: 200, description: 'Audit events list' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async queryAuditLogs(@Query() query: AuditQueryDto) {
    return this.auditService.query(query);
  }
}
