import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  AssignDeviceDto,
  CreateMaintenanceContractDto,
} from './dto';
import { CurrentUser, Roles, JwtPayload } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole, DeviceInstanceStatus } from '@common/enums';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Register a new device (OPS only)' })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Access denied - OPS role required' })
  @ApiResponse({ status: 409, description: 'Serial number already exists' })
  async createDevice(
    @Body() dto: CreateDeviceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.createDevice(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List devices (filtered by role)' })
  @ApiResponse({ status: 200, description: 'List of devices' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'IN_REPAIR', 'REPLACED', 'DECOMMISSIONED'],
    description: 'Filter by device status',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Filter by product ID',
  })
  async listDevices(
    @CurrentUser() user: JwtPayload,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('productId') productId?: string,
  ) {
    return this.deviceService.listDevices(
      user.sub,
      user.role as UserRole,
      {
        ...paginationQuery,
        status,
        productId,
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device details' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Device details' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getDevice(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.getDevice(id, user.sub, user.role as UserRole);
  }

  @Patch(':id')
  @Roles(UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Update device details' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async updateDevice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.updateDevice(id, dto, user.sub);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Assign device to patient/case' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Device assigned successfully' })
  @ApiResponse({ status: 400, description: 'Device already assigned or invalid data' })
  @ApiResponse({ status: 403, description: 'Access denied - OPS role required' })
  @ApiResponse({ status: 404, description: 'Device, patient, or case not found' })
  async assignDevice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignDeviceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.assignDevice(id, dto, user.sub);
  }

  @Post(':id/unassign')
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Unassign device from patient/case' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Device unassigned successfully' })
  @ApiResponse({ status: 400, description: 'Device is not assigned' })
  @ApiResponse({ status: 403, description: 'Access denied - OPS role required' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async unassignDevice(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.unassignDevice(id, user.sub);
  }

  @Get(':id/maintenance-history')
  @ApiOperation({ summary: 'Get maintenance records for a device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Maintenance history' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getMaintenanceHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.getMaintenanceHistory(
      id,
      user.sub,
      user.role as UserRole,
      paginationQuery,
    );
  }

  @Post(':id/maintenance-contracts')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Create maintenance contract for a device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 201, description: 'Maintenance contract created' })
  @ApiResponse({ status: 400, description: 'Invalid contract data' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 409, description: 'Device already has active contract' })
  async createMaintenanceContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMaintenanceContractDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.createMaintenanceContract(id, dto, user.sub);
  }

  @Get(':id/maintenance-contracts')
  @ApiOperation({ summary: 'List maintenance contracts for a device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'List of maintenance contracts' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async listMaintenanceContracts(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deviceService.listMaintenanceContracts(
      id,
      user.sub,
      user.role as UserRole,
    );
  }
}
