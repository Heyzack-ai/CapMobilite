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
import { ChatService } from './chat.service';
import {
  CreateChatSessionDto,
  SendMessageDto,
  EscalateChatDto,
  ResolveChatDto,
  ChatSessionResponseDto,
  ChatMessageResponseDto,
  ChatMessagesListResponseDto,
} from './dto';
import { CurrentUser, JwtPayload, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole } from '@common/enums';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // =========================================================================
  // Chat Sessions
  // =========================================================================

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'Chat session created', type: ChatSessionResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied to case' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async createSession(
    @Body() dto: CreateChatSessionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.createSession(dto, user.sub, user.role as UserRole);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List chat sessions for current user' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: ACTIVE, ESCALATED, CLOSED' })
  @ApiResponse({ status: 200, description: 'List of chat sessions' })
  async listSessions(
    @Query() query: PaginationQueryDto,
    @Query('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.getUserSessions(
      user.sub,
      user.role as UserRole,
      { ...query, status },
    );
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get chat session details' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 200, description: 'Chat session details', type: ChatSessionResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.getSession(sessionId, user.sub, user.role as UserRole);
  }

  // =========================================================================
  // Chat Messages
  // =========================================================================

  @Post('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Send a message in a chat session' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 201, description: 'Message sent', type: ChatMessageResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot send to closed session' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async sendMessage(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.sendMessage(
      sessionId,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get messages in a chat session' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 200, description: 'List of messages', type: ChatMessagesListResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getMessages(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.getMessages(
      sessionId,
      user.sub,
      user.role as UserRole,
      query,
    );
  }

  // =========================================================================
  // Session Actions
  // =========================================================================

  @Post('sessions/:sessionId/escalate')
  @ApiOperation({ summary: 'Escalate chat session to human support' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 200, description: 'Session escalated', type: ChatSessionResponseDto })
  @ApiResponse({ status: 400, description: 'Session already escalated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async escalateSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: EscalateChatDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.escalateSession(
      sessionId,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post('sessions/:sessionId/resolve')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Resolve chat session (staff only)' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 200, description: 'Session resolved', type: ChatSessionResponseDto })
  @ApiResponse({ status: 400, description: 'Session already resolved' })
  @ApiResponse({ status: 403, description: 'Only staff can resolve sessions' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async resolveSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: ResolveChatDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.resolveSession(
      sessionId,
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post('sessions/:sessionId/close')
  @ApiOperation({ summary: 'Close a chat session' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 200, description: 'Session closed', type: ChatSessionResponseDto })
  @ApiResponse({ status: 400, description: 'Session already closed' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async closeSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.closeSession(sessionId, user.sub, user.role as UserRole);
  }

  @Patch('sessions/:sessionId/assign')
  @Roles(UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Assign chat session to staff member' })
  @ApiParam({ name: 'sessionId', description: 'Chat session ID' })
  @ApiResponse({ status: 200, description: 'Session assigned', type: ChatSessionResponseDto })
  @ApiResponse({ status: 400, description: 'Assignee must be staff' })
  @ApiResponse({ status: 403, description: 'Only staff can assign sessions' })
  @ApiResponse({ status: 404, description: 'Session or assignee not found' })
  async assignSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body('assigneeId', ParseUUIDPipe) assigneeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.assignSession(
      sessionId,
      assigneeId,
      user.sub,
      user.role as UserRole,
    );
  }
}
