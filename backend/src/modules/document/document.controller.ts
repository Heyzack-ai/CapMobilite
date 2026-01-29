import {
  Controller,
  Post,
  Get,
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
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DocumentService } from './document.service';
import {
  PresignUploadDto,
  PresignUploadResponseDto,
  CompleteUploadDto,
  DocumentResponseDto,
} from './dto';
import { CurrentUser, JwtPayload } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole } from '@common/enums';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('presign')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Get pre-signed URL for document upload' })
  @ApiResponse({
    status: 201,
    description: 'Pre-signed URL generated',
    type: PresignUploadResponseDto,
  })
  async presignUpload(
    @Body() dto: PresignUploadDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PresignUploadResponseDto> {
    return this.documentService.createPresignedUploadUrl(
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete document upload and trigger scan' })
  @ApiResponse({ status: 201, description: 'Upload completed' })
  async completeUpload(
    @Body() dto: CompleteUploadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentService.completeUpload(
      dto,
      user.sub,
      user.role as UserRole,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata' })
  @ApiResponse({
    status: 200,
    description: 'Document metadata',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentService.getDocument(id, user.sub, user.role as UserRole);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get pre-signed download URL' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentService.getDownloadUrl(
      id,
      user.sub,
      user.role as UserRole,
    );
  }
}

@ApiTags('User Documents')
@ApiBearerAuth()
@Controller('me/documents')
export class UserDocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'List my documents' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async listDocuments(
    @Query() query: PaginationQueryDto,
    @Query('documentType') documentType: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentService.listUserDocuments(
      user.sub,
      user.role as UserRole,
      { ...query, documentType },
    );
  }
}
