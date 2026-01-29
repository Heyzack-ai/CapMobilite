import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
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
import { Request } from 'express';
import { ConsentService } from './consent.service';
import {
  CreateConsentDto,
  ConsentResponseDto,
  ConsentListResponseDto,
} from './dto';
import { CurrentUser, Roles } from '@common/decorators';
import { UserRole, ConsentType } from '@common/enums';

@ApiTags('Consents')
@ApiBearerAuth()
@Controller('me/consents')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Get()
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'List all consents',
    description: 'Get all consent records for the current user, including withdrawn consents.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of consents',
    type: ConsentListResponseDto,
  })
  async getConsents(
    @CurrentUser('sub') userId: string,
  ): Promise<ConsentListResponseDto> {
    return this.consentService.getConsents(userId);
  }

  @Get(':consentType')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Get specific consent by type',
    description: 'Get the active consent record for a specific type.',
  })
  @ApiParam({
    name: 'consentType',
    enum: ConsentType,
    description: 'Type of consent to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent details',
    type: ConsentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No active consent found for this type' })
  async getConsentByType(
    @CurrentUser('sub') userId: string,
    @Param('consentType') consentType: ConsentType,
  ): Promise<ConsentResponseDto> {
    return this.consentService.getConsentByType(userId, consentType);
  }

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Give consent',
    description: 'Record a new consent. If a consent of the same type exists, the old one is withdrawn and a new one is created.',
  })
  @ApiResponse({
    status: 201,
    description: 'Consent recorded successfully',
    type: ConsentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid consent data' })
  async createConsent(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateConsentDto,
    @Req() request: Request,
  ): Promise<ConsentResponseDto> {
    const ipAddress = request.ip || request.socket?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    return this.consentService.createConsent(userId, dto, ipAddress, userAgent);
  }

  @Delete(':consentType')
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Withdraw consent',
    description: 'Withdraw a previously given consent. Note: Terms of Service consent cannot be withdrawn.',
  })
  @ApiParam({
    name: 'consentType',
    enum: ConsentType,
    description: 'Type of consent to withdraw',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent withdrawn successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot withdraw this consent type' })
  @ApiResponse({ status: 404, description: 'No active consent found for this type' })
  async withdrawConsent(
    @CurrentUser('sub') userId: string,
    @Param('consentType') consentType: ConsentType,
  ): Promise<{ message: string; withdrawnAt: Date }> {
    return this.consentService.withdrawConsent(userId, consentType);
  }
}
