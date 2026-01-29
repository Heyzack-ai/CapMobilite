import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
import { CaseService } from './case.service';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CreateCaseNoteDto,
  CreateCaseTaskDto,
  UpdateCaseTaskDto,
  AttachCaseDocumentDto,
} from './dto';
import { CurrentUser, JwtPayload, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole, CaseStatus, CasePriority, TaskStatus } from '@common/enums';

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Create a new case (patient only)' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Only patients can create cases' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async createCase(
    @Body() dto: CreateCaseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.createCase(dto, user.sub, user.role as UserRole);
  }

  @Get()
  @ApiOperation({ summary: 'List cases (filtered by role)' })
  @ApiQuery({ name: 'status', required: false, enum: CaseStatus })
  @ApiQuery({ name: 'priority', required: false, enum: CasePriority })
  @ApiResponse({ status: 200, description: 'List of cases' })
  async listCases(
    @Query() query: PaginationQueryDto,
    @Query('status') status: CaseStatus,
    @Query('priority') priority: CasePriority,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.listCases(user.sub, user.role as UserRole, {
      ...query,
      status,
      priority,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case details' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Case details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCase(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.getCase(id, user.sub, user.role as UserRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'Case updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async updateCase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCaseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.updateCase(id, dto, user.sub, user.role as UserRole);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to a case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 201, description: 'Note added successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async addCaseNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCaseNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.addCaseNote(id, dto, user.sub, user.role as UserRole);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get case notes' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'List of case notes' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.getCaseNotes(id, user.sub, user.role as UserRole, query);
  }

  @Post(':id/tasks')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Create a task for a case (staff only)' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 403, description: 'Only staff can create tasks' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async createCaseTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCaseTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.createCaseTask(id, dto, user.sub, user.role as UserRole);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'List case tasks' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiResponse({ status: 200, description: 'List of case tasks' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseTasks(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
    @Query('status') status: TaskStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.getCaseTasks(id, user.sub, user.role as UserRole, {
      ...query,
      status,
    });
  }

  @Patch(':id/tasks/:taskId')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Update a case task (staff only)' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 403, description: 'Only staff can update tasks' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateCaseTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateCaseTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.updateCaseTask(
      id,
      taskId,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  // =========================================================================
  // Case Documents
  // =========================================================================

  @Post(':id/documents')
  @ApiOperation({ summary: 'Attach a document to a case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 201, description: 'Document attached successfully' })
  @ApiResponse({ status: 400, description: 'Document already attached' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case or document not found' })
  async attachDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AttachCaseDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.attachDocument(
      id,
      dto.documentId,
      user.sub,
      user.role as UserRole,
    );
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'List documents attached to a case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({ status: 200, description: 'List of case documents' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async listCaseDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.listCaseDocuments(
      id,
      user.sub,
      user.role as UserRole,
    );
  }

  @Delete(':id/documents/:documentId')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Remove a document from a case (staff only)' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document removed successfully' })
  @ApiResponse({ status: 403, description: 'Only staff can remove documents' })
  @ApiResponse({ status: 404, description: 'Document attachment not found' })
  async removeDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseService.removeDocument(
      id,
      documentId,
      user.sub,
      user.role as UserRole,
    );
  }
}
