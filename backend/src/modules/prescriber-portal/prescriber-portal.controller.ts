import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PrescriberPortalService } from './prescriber-portal.service';
import {
  GeneratePrescriberLinkDto,
  SubmitPrescriptionDto,
  PrescriberLinkResponseDto,
  ValidateLinkResponseDto,
  SubmitPrescriptionResponseDto,
} from './dto';
import { CurrentUser, JwtPayload, Roles, Public } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Prescriber Portal')
@Controller('prescriber')
export class PrescriberPortalController {
  constructor(private readonly prescriberPortalService: PrescriberPortalService) {}

  // =========================================================================
  // Authenticated Endpoints (for patients/staff to generate links)
  // =========================================================================

  @Post('links')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate one-time prescriber upload link' })
  @ApiResponse({ status: 201, description: 'Link generated successfully', type: PrescriberLinkResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async generateLink(
    @Body() dto: GeneratePrescriberLinkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriberPortalService.generateLink(
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Get('links/patient/:patientId')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT, UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'List prescriber links for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient profile ID' })
  @ApiResponse({ status: 200, description: 'List of prescriber links' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async listLinks(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriberPortalService.listLinks(
      patientId,
      user.sub,
      user.role as UserRole,
    );
  }

  @Delete('links/:linkId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a prescriber link' })
  @ApiParam({ name: 'linkId', description: 'Link ID' })
  @ApiResponse({ status: 200, description: 'Link revoked successfully' })
  @ApiResponse({ status: 400, description: 'Link already used' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async revokeLink(
    @Param('linkId', ParseUUIDPipe) linkId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriberPortalService.revokeLink(
      linkId,
      user.sub,
      user.role as UserRole,
    );
  }

  // =========================================================================
  // Public Endpoints (for prescribers without accounts)
  // =========================================================================

  @Get('links/:token/validate')
  @Public()
  @ApiOperation({ summary: 'Validate prescriber link (public)' })
  @ApiParam({ name: 'token', description: 'Prescriber link token' })
  @ApiResponse({ status: 200, description: 'Link validation result', type: ValidateLinkResponseDto })
  async validateLink(@Param('token') token: string) {
    return this.prescriberPortalService.validateLink(token);
  }

  @Post('links/:token/submit')
  @Public()
  @ApiOperation({ summary: 'Submit prescription via link (public)' })
  @ApiParam({ name: 'token', description: 'Prescriber link token' })
  @ApiResponse({ status: 201, description: 'Prescription submitted', type: SubmitPrescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Link expired or already used' })
  @ApiResponse({ status: 404, description: 'Invalid link or document not found' })
  async submitPrescription(
    @Param('token') token: string,
    @Body() dto: SubmitPrescriptionDto,
  ) {
    return this.prescriberPortalService.submitPrescription(token, dto);
  }
}
