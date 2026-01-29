import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  NotificationQueryDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
  BulkOperationResponseDto,
} from './dto';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of notifications',
  })
  async findAll(
    @Query() query: NotificationQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    data: NotificationResponseDto[];
    pagination: { cursor?: string; hasMore: boolean; limit: number };
  }> {
    return this.notificationService.findAll(user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread notification count',
    type: UnreadCountResponseDto,
  })
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationService.getUnreadCount(user.sub);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification details',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.findOne(
      id,
      user.sub,
      user.role as UserRole,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(
      id,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    type: BulkOperationResponseDto,
  })
  async markAllAsRead(
    @CurrentUser() user: JwtPayload,
  ): Promise<BulkOperationResponseDto> {
    const result = await this.notificationService.markAllAsRead(user.sub);
    return {
      success: true,
      count: result.count,
      message: `${result.count} notification(s) marked as read`,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.notificationService.delete(
      id,
      user.sub,
      user.role as UserRole,
    );
  }
}
