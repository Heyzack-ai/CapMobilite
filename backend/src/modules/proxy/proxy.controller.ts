import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import {
  InviteProxyDto,
  AcceptProxyInvitationDto,
  SwitchPatientContextDto,
  ProxyRelationshipResponseDto,
  ProxyInvitationResponseDto,
  PatientsListResponseDto,
  ProxiesListResponseDto,
} from './dto';
import { CurrentUser, Public, Roles } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Proxy/Caregiver')
@ApiBearerAuth()
@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // =========================================================================
  // Patient endpoints - managing their proxies
  // =========================================================================

  @Post('me/proxy/invite')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Invite a proxy',
    description: 'Invite someone to act as a proxy/caregiver for the patient. An email will be sent with instructions to accept.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation sent successfully',
    type: ProxyInvitationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 409, description: 'Proxy relationship already exists' })
  async inviteProxy(
    @CurrentUser('sub') userId: string,
    @Body() dto: InviteProxyDto,
  ): Promise<ProxyInvitationResponseDto> {
    return this.proxyService.inviteProxy(userId, dto);
  }

  @Get('me/proxy')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'List my proxies',
    description: 'Get list of all active proxies for the current patient.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of proxies',
    type: ProxiesListResponseDto,
  })
  async getMyProxies(
    @CurrentUser('sub') userId: string,
  ): Promise<ProxiesListResponseDto> {
    return this.proxyService.getProxies(userId);
  }

  @Delete('me/proxy/:id')
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke a proxy',
    description: 'Revoke an existing proxy relationship.',
  })
  @ApiParam({ name: 'id', description: 'Proxy relationship ID' })
  @ApiResponse({ status: 200, description: 'Proxy revoked successfully' })
  @ApiResponse({ status: 404, description: 'Proxy relationship not found' })
  async revokeProxy(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.proxyService.revokeProxy(userId, id);
  }

  // =========================================================================
  // Proxy/Caregiver endpoints - managing patients they represent
  // =========================================================================

  @Post('proxy/accept')
  @ApiOperation({
    summary: 'Accept proxy invitation',
    description: 'Accept a proxy invitation using the token received via email.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation accepted, proxy relationship created',
    type: ProxyRelationshipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Email mismatch' })
  async acceptInvitation(
    @CurrentUser('sub') userId: string,
    @Body() dto: AcceptProxyInvitationDto,
  ): Promise<ProxyRelationshipResponseDto> {
    return this.proxyService.acceptInvitation(userId, dto);
  }

  @Get('me/proxy/patients')
  @ApiOperation({
    summary: 'List patients I can act for',
    description: 'Get list of all patients the current user can act as proxy for.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of patients',
    type: PatientsListResponseDto,
  })
  async getMyPatients(
    @CurrentUser('sub') userId: string,
  ): Promise<PatientsListResponseDto> {
    return this.proxyService.getPatients(userId);
  }

  @Post('me/proxy/switch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Switch patient context',
    description: 'Switch to act as a specific patient. Returns context info to use in subsequent requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Context switched successfully',
  })
  @ApiResponse({ status: 403, description: 'No permission to act as this patient' })
  async switchPatientContext(
    @CurrentUser('sub') userId: string,
    @Body() dto: SwitchPatientContextDto,
  ): Promise<{ patientId: string; patientName: string }> {
    return this.proxyService.switchPatientContext(userId, dto);
  }
}
