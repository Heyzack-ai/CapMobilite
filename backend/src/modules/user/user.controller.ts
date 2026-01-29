import {
  Controller,
  Get,
  Put,
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
import { UserService } from './user.service';
import { UpdatePatientProfileDto, UpdateNirDto, UpdateNotificationPreferencesDto } from './dto';
import { CurrentUser } from '@common/decorators';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'User does not have patient profile' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return this.userService.updatePatientProfile(userId, dto);
  }

  @Put('profile/nir')
  @ApiOperation({ summary: 'Update NIR/Carte Vitale (requires password)' })
  @ApiResponse({ status: 200, description: 'Sensitive information updated' })
  @ApiResponse({ status: 403, description: 'Invalid password' })
  async updateNir(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNirDto,
  ) {
    return this.userService.updateNir(userId, dto);
  }

  // =========================================================================
  // Notification Preferences
  // =========================================================================

  @Get('notifications/preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved' })
  async getNotificationPreferences(@CurrentUser('sub') userId: string) {
    return this.userService.getNotificationPreferences(userId);
  }

  @Put('notifications/preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  async updateNotificationPreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.userService.updateNotificationPreferences(userId, dto);
  }

  // =========================================================================
  // Devices (Login Sessions)
  // =========================================================================

  @Get('devices')
  @ApiOperation({ summary: 'Get logged-in devices/sessions' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getUserDevices(@CurrentUser('sub') userId: string) {
    return this.userService.getUserDevices(userId);
  }

  @Delete('devices/:sessionId')
  @ApiOperation({ summary: 'Revoke a device session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID to revoke' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeDevice(
    @CurrentUser('sub') userId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return this.userService.revokeDevice(userId, sessionId);
  }

  // =========================================================================
  // Service Tickets
  // =========================================================================

  @Get('tickets')
  @ApiOperation({ summary: 'Get user service tickets' })
  @ApiResponse({ status: 200, description: 'List of service tickets' })
  async getUserTickets(@CurrentUser('sub') userId: string) {
    return this.userService.getUserTickets(userId);
  }
}
