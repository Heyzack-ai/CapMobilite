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
import { ServiceTicketService, TicketFilters } from './service-ticket.service';
import {
  CreateServiceTicketDto,
  UpdateServiceTicketDto,
  AssignTicketDto,
  CreateVisitDto,
  UpdateVisitDto,
  RecordPartUsageDto,
} from './dto';
import { CurrentUser, Roles } from '@common/decorators';
import { UserRole, TicketStatus, TicketSeverity } from '@common/enums';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

@ApiTags('Service Tickets')
@ApiBearerAuth()
@Controller('service-tickets')
export class ServiceTicketController {
  constructor(private readonly serviceTicketService: ServiceTicketService) {}

  // =========================================================================
  // Ticket CRUD Operations
  // =========================================================================

  @Post()
  @ApiOperation({
    summary: 'Create a new service ticket',
    description: 'Create a maintenance or repair request for a device. Available to patients (for their own devices) and staff.',
  })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or device not found' })
  @ApiResponse({ status: 403, description: 'No permission to create ticket for this device' })
  async createTicket(
    @Body() dto: CreateServiceTicketDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.create(dto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'List service tickets',
    description: 'Get a paginated list of service tickets with optional filters.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TicketStatus,
    description: 'Filter by ticket status',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    enum: TicketSeverity,
    description: 'Filter by ticket severity',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter by assigned technician ID',
  })
  @ApiQuery({
    name: 'deviceId',
    required: false,
    description: 'Filter by device ID',
  })
  @ApiQuery({
    name: 'reportedBy',
    required: false,
    description: 'Filter by reporter user ID',
  })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  async listTickets(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: TicketStatus,
    @Query('severity') severity?: TicketSeverity,
    @Query('assignedTo') assignedTo?: string,
    @Query('deviceId') deviceId?: string,
    @Query('reportedBy') reportedBy?: string,
  ) {
    const filters: TicketFilters = {
      status,
      severity,
      assignedTo,
      deviceId,
      reportedBy,
    };

    return this.serviceTicketService.findAll(
      filters,
      paginationQuery.cursor,
      paginationQuery.limit,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ticket details',
    description: 'Get detailed information about a specific service ticket including visits and parts.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceTicketService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a service ticket',
    description: 'Update ticket details such as category, severity, status, or resolution notes.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceTicketDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.update(id, dto, userId);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Assign ticket to a technician',
    description: 'Assign a service ticket to a technician for handling. Restricted to OPS, Technician, and Compliance Admin roles.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid technician or technician not active' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Ticket or technician not found' })
  async assignTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.assign(id, dto, userId);
  }

  @Post(':id/close')
  @Roles(UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Close a service ticket',
    description: 'Close a resolved ticket with final resolution notes. Ticket must be in RESOLVED status.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket closed successfully' })
  @ApiResponse({ status: 400, description: 'Ticket not in RESOLVED status' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async closeTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('resolutionNotes') resolutionNotes: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.close(id, resolutionNotes, userId);
  }

  // =========================================================================
  // Visit Management
  // =========================================================================

  @Post(':id/visits')
  @Roles(UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Schedule a technician visit',
    description: 'Schedule a new visit for a service ticket. Technician defaults to assigned technician if not specified.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 201, description: 'Visit scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or no technician assigned' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async createVisit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVisitDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.createVisit(id, dto, userId);
  }

  @Get(':id/visits')
  @ApiOperation({
    summary: 'List visits for a ticket',
    description: 'Get all scheduled and completed visits for a service ticket.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'List of visits' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getVisits(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceTicketService.getVisits(id);
  }

  @Patch(':id/visits/:visitId')
  @Roles(UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Update a visit',
    description: 'Update visit details including arrival time, completion time, outcome, and notes.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiParam({ name: 'visitId', description: 'Visit ID' })
  @ApiResponse({ status: 200, description: 'Visit updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async updateVisit(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Body() dto: UpdateVisitDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.updateVisit(id, visitId, dto, userId);
  }

  // =========================================================================
  // Parts Usage Tracking
  // =========================================================================

  @Post(':id/visits/:visitId/parts')
  @Roles(UserRole.OPS, UserRole.TECHNICIAN, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Record parts used during a visit',
    description: 'Record parts and their costs used during a technician visit for billing purposes.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiParam({ name: 'visitId', description: 'Visit ID' })
  @ApiResponse({ status: 201, description: 'Part usage recorded successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async recordPartUsage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Body() dto: RecordPartUsageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceTicketService.recordPartUsage(id, visitId, dto, userId);
  }

  @Get(':id/parts')
  @ApiOperation({
    summary: 'Get parts usage summary for a ticket',
    description: 'Get all parts used for a ticket with total cost calculation.',
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Parts usage summary' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getPartsUsage(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceTicketService.getPartsUsage(id);
  }
}
