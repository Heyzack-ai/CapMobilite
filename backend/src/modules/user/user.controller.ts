import {
  Controller,
  Get,
  Put,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdatePatientProfileDto, UpdateNirDto } from './dto';
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
}
