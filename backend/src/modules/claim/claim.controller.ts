import {
  Controller,
  Post,
  Get,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ClaimService } from './claim.service';
import {
  CreateClaimDto,
  UpdateClaimDto,
  CreateClaimReturnDto,
  CreatePaymentDto,
  AttachDocumentRequestDto,
  ClaimResponseDto,
  ClaimDocumentResponseDto,
  ClaimReturnResponseDto,
  PaymentResponseDto,
} from './dto';
import { CurrentUser, JwtPayload, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole, ClaimStatus } from '@common/enums';

@ApiTags('Claims')
@ApiBearerAuth()
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Post()
  @Roles(UserRole.BILLING)
  @ApiOperation({
    summary: 'Create claim from approved quote',
    description:
      'Creates a new CPAM claim from an approved quote. Only BILLING users can create claims.',
  })
  @ApiResponse({
    status: 201,
    description: 'Claim created successfully',
    type: ClaimResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Quote not approved or claim already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires BILLING role' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async createClaim(
    @Body() dto: CreateClaimDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimResponseDto> {
    return this.claimService.createClaim(dto, user.sub, user.role as UserRole);
  }

  @Get()
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'List claims',
    description: 'Get a paginated list of claims with optional filtering.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ClaimStatus,
    description: 'Filter by claim status',
  })
  @ApiQuery({
    name: 'caseId',
    required: false,
    description: 'Filter by case ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of claims',
  })
  async listClaims(
    @Query() pagination: PaginationQueryDto,
    @Query('status') status: ClaimStatus | undefined,
    @Query('caseId') caseId: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.claimService.listClaims(
      { ...pagination, status, caseId },
      user.sub,
      user.role as UserRole,
    );
  }

  @Get(':id')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'Get claim details',
    description: 'Get detailed information about a specific claim.',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim details',
    type: ClaimResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async getClaimById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimResponseDto> {
    return this.claimService.getClaimById(id, user.sub, user.role as UserRole);
  }

  @Patch(':id')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'Update claim',
    description: 'Update claim details such as status, gateway reference, or rejection info.',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim updated successfully',
    type: ClaimResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async updateClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimResponseDto> {
    return this.claimService.updateClaim(id, dto, user.sub, user.role as UserRole);
  }

  @Post(':id/submit')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'Submit claim to CPAM',
    description:
      'Submit a draft claim to CPAM for processing. Requires all mandatory documents to be attached.',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim submitted successfully',
    type: ClaimResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Missing required documents or invalid status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async submitClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimResponseDto> {
    return this.claimService.submitClaim(id, user.sub, user.role as UserRole);
  }

  @Post(':id/documents')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'Attach document to claim',
    description: 'Attach a document to the claim for SCOR bundle submission.',
  })
  @ApiResponse({
    status: 201,
    description: 'Document attached successfully',
    type: ClaimDocumentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Document already attached' })
  @ApiResponse({ status: 404, description: 'Claim or document not found' })
  async attachDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AttachDocumentRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimDocumentResponseDto> {
    return this.claimService.attachDocument(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Get(':id/documents')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'List claim documents',
    description: 'Get all documents attached to a claim.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attached documents',
    type: [ClaimDocumentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async listClaimDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimDocumentResponseDto[]> {
    return this.claimService.listClaimDocuments(
      id,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post(':id/returns')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'Record CPAM return',
    description:
      'Record a return/response file from CPAM (NOEMIE, ARO, ARL, etc.).',
  })
  @ApiResponse({
    status: 201,
    description: 'Return recorded successfully',
    type: ClaimReturnResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async createClaimReturn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateClaimReturnDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimReturnResponseDto> {
    return this.claimService.createClaimReturn(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Get(':id/returns')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'List claim returns',
    description: 'Get all CPAM returns/responses for a claim.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of CPAM returns',
    type: [ClaimReturnResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async listClaimReturns(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClaimReturnResponseDto[]> {
    return this.claimService.listClaimReturns(
      id,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post(':id/payments')
  @Roles(UserRole.BILLING, UserRole.OPS)
  @ApiOperation({
    summary: 'Record payment received',
    description:
      'Record a payment received for the claim. Supports partial payments.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Payment exceeds remaining balance' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async createPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaymentResponseDto> {
    return this.claimService.createPayment(
      id,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }
}
