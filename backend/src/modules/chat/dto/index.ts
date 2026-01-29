import { IsUUID, IsOptional, IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ChatSessionStatus {
  OPEN = 'OPEN',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

/**
 * Create chat session request
 */
export class CreateChatSessionDto {
  @ApiPropertyOptional({ description: 'Case ID to associate with the chat session' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional({ description: 'Initial message to start the session' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  initialMessage?: string;

  @ApiPropertyOptional({ description: 'Session topic/subject' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;
}

/**
 * Send chat message request
 */
export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'Attached document IDs' })
  @IsOptional()
  @IsUUID('4', { each: true })
  attachmentIds?: string[];
}

/**
 * Escalate chat session request
 */
export class EscalateChatDto {
  @ApiProperty({ description: 'Reason for escalation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Priority level (1=low, 2=medium, 3=high)' })
  @IsOptional()
  priority?: number;
}

/**
 * Resolve chat session request
 */
export class ResolveChatDto {
  @ApiPropertyOptional({ description: 'Resolution notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNotes?: string;
}

/**
 * Chat session response
 */
export class ChatSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  caseId?: string;

  @ApiProperty()
  status: ChatSessionStatus;

  @ApiPropertyOptional()
  topic?: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  escalatedAt?: Date;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * Chat message response
 */
export class ChatMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  senderRole: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  isFromUser: boolean;

  @ApiPropertyOptional()
  attachments?: { id: string; filename: string }[];

  @ApiProperty()
  createdAt: Date;
}

/**
 * Chat messages list response
 */
export class ChatMessagesListResponseDto {
  @ApiProperty({ type: [ChatMessageResponseDto] })
  data: ChatMessageResponseDto[];

  @ApiProperty()
  total: number;

  @ApiPropertyOptional()
  hasMore?: boolean;
}
