import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrescriptionService } from './prescription.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  VerifyPrescriptionDto,
  RejectPrescriptionDto,
  LinkCaseDto,
} from './dto';
import { CurrentUser, JwtPayload, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole, PrescriptionStatus } from '@common/enums';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Roles(UserRole.PATIENT, UserRole.PRESCRIBER, UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Upload a new prescription',
    description: 'Create a prescription record with reference to an uploaded document. Patients can upload their own prescriptions, prescribers can upload for their patients.',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or prescription date',
  })
  @ApiResponse({
    status: 404,
    description: 'Document or patient not found',
  })
  async create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.create(dto, user.sub, user.role as UserRole);
  }

  @Get()
  @Roles(
    UserRole.PATIENT,
    UserRole.PRESCRIBER,
    UserRole.OPS,
    UserRole.COMPLIANCE_ADMIN,
    UserRole.BILLING,
  )
  @ApiOperation({
    summary: 'List prescriptions',
    description: 'List prescriptions with optional filtering. Patients see their own, prescribers see those they created, staff see all.',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filter by patient ID (staff only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PrescriptionStatus,
    description: 'Filter by prescription status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of prescriptions with pagination',
  })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationQueryDto,
    @Query('patientId') patientId?: string,
    @Query('status') status?: PrescriptionStatus,
  ) {
    return this.prescriptionService.findAll(
      user.sub,
      user.role as UserRole,
      pagination,
      { patientId, status },
    );
  }

  @Get(':id')
  @Roles(
    UserRole.PATIENT,
    UserRole.PRESCRIBER,
    UserRole.OPS,
    UserRole.COMPLIANCE_ADMIN,
    UserRole.BILLING,
  )
  @ApiOperation({
    summary: 'Get prescription details',
    description: 'Retrieve detailed information about a specific prescription',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription details',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.findOne(id, user.sub, user.role as UserRole);
  }

  @Patch(':id')
  @Roles(UserRole.PRESCRIBER, UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Update prescription details',
    description: 'Update prescription information. Cannot update verified prescriptions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update verified prescription',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrescriptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.update(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Verify a prescription',
    description: 'Mark a prescription as verified after validating prescriber credentials. Only OPS or Compliance Admin can verify.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Prescription already verified or expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Only OPS or Compliance Admin can verify',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  async verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPrescriptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.verify(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Reject a prescription',
    description: 'Reject a prescription with a reason. Only OPS or Compliance Admin can reject.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription rejected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Prescription already verified',
  })
  @ApiResponse({
    status: 403,
    description: 'Only OPS or Compliance Admin can reject',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectPrescriptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.reject(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post(':id/link-case')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PATIENT, UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({
    summary: 'Link prescription to a case',
    description: 'Associate a prescription with an existing case. The case must belong to the same patient.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription linked to case successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Case belongs to different patient',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription or case not found',
  })
  async linkToCase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkCaseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.linkToCase(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }
}
