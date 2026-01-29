import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { S3Service } from '@integrations/s3';
import { QueueService, QUEUE_NAMES } from '@integrations/queue';
import { generateUUID } from '@common/utils';
import { OwnerType, ScanStatus, UserRole } from '@common/enums';
import {
  PresignUploadDto,
  PresignUploadResponseDto,
  CompleteUploadDto,
} from './dto';
import { PaginationQueryDto } from '@common/dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private queueService: QueueService,
  ) {}

  async createPresignedUploadUrl(
    dto: PresignUploadDto,
    userId: string,
    userRole: UserRole,
  ): Promise<PresignUploadResponseDto> {
    // Generate unique storage key
    const timestamp = Date.now();
    const uniqueId = generateUUID();
    const extension = dto.filename.split('.').pop() || '';
    const storageKey = `${dto.documentType.toLowerCase()}/${userId}/${timestamp}-${uniqueId}.${extension}`;

    const bucket = this.s3Service.getBucketName('documents');

    const uploadUrl = await this.s3Service.getPresignedUploadUrl({
      bucket,
      key: storageKey,
      contentType: dto.mimeType,
      expiresIn: 3600, // 1 hour
    });

    this.logger.debug(`Created presigned URL for ${storageKey}`);

    return {
      uploadUrl,
      storageKey,
      expiresIn: 3600,
    };
  }

  async completeUpload(
    dto: CompleteUploadDto,
    userId: string,
    userRole: UserRole,
  ) {
    // Verify the file exists in S3
    const bucket = this.s3Service.getBucketName('documents');
    const exists = await this.s3Service.objectExists(bucket, dto.storageKey);

    if (!exists) {
      throw new BadRequestException('File not found in storage');
    }

    // Extract document type from storage key
    const documentTypePart = dto.storageKey.split('/')[0];
    const documentType = documentTypePart.toUpperCase();

    // Determine owner type based on user role
    const ownerType = this.getOwnerType(userRole);

    // Get file info from storage key
    const filename = dto.storageKey.split('/').pop() || 'unknown';

    // Create document record
    const document = await this.prisma.document.create({
      data: {
        ownerId: userId,
        ownerType,
        documentType: documentType as any,
        filename,
        mimeType: this.getMimeTypeFromExtension(filename),
        sizeBytes: 0, // Could be updated from S3 metadata
        storageKey: dto.storageKey,
        sha256Hash: dto.sha256Hash,
        metadata: dto.metadata || {},
        scanStatus: ScanStatus.PENDING,
      },
    });

    // Queue antivirus scan job
    await this.queueService.addJob(
      QUEUE_NAMES.DOCUMENTS,
      'scan-document',
      {
        documentId: document.id,
        storageKey: dto.storageKey,
        bucket,
      },
      { attempts: 3 },
    );

    this.logger.log(`Document ${document.id} created, scan queued`);

    return {
      id: document.id,
      filename: document.filename,
      documentType: document.documentType,
      scanStatus: document.scanStatus,
      createdAt: document.createdAt,
    };
  }

  async getDocument(documentId: string, userId: string, userRole: UserRole) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.deletedAt) {
      throw new NotFoundException('Document not found');
    }

    // Check access permissions
    if (!this.canAccessDocument(document, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: document.id,
      filename: document.filename,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      documentType: document.documentType,
      scanStatus: document.scanStatus,
      scanCompletedAt: document.scanCompletedAt,
      metadata: document.metadata,
      createdAt: document.createdAt,
    };
  }

  async getDownloadUrl(documentId: string, userId: string, userRole: UserRole) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.deletedAt) {
      throw new NotFoundException('Document not found');
    }

    // Check access permissions
    if (!this.canAccessDocument(document, userId, userRole)) {
      throw new ForbiddenException('Access denied');
    }

    // Only allow download of clean documents
    if (document.scanStatus !== ScanStatus.CLEAN) {
      throw new BadRequestException('Document has not passed security scan');
    }

    const bucket = this.s3Service.getBucketName('documents');
    const downloadUrl = await this.s3Service.getPresignedDownloadUrl({
      bucket,
      key: document.storageKey,
      expiresIn: 300, // 5 minutes
    });

    return {
      downloadUrl,
      filename: document.filename,
      mimeType: document.mimeType,
      expiresIn: 300,
    };
  }

  async listUserDocuments(
    userId: string,
    userRole: UserRole,
    query: PaginationQueryDto & { documentType?: string },
  ) {
    const where: any = {
      ownerId: userId,
      deletedAt: null,
    };

    if (query.documentType) {
      where.documentType = query.documentType;
    }

    const documents = await this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        documentType: true,
        scanStatus: true,
        createdAt: true,
      },
    });

    const hasMore = documents.length > query.limit;
    const data = hasMore ? documents.slice(0, -1) : documents;

    return {
      data,
      pagination: {
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
        hasMore,
        limit: query.limit,
      },
    };
  }

  async updateScanStatus(
    documentId: string,
    status: ScanStatus,
    metadata?: Record<string, any>,
  ) {
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        scanStatus: status,
        scanCompletedAt: new Date(),
        ...(metadata && {
          metadata: {
            ...(await this.prisma.document.findUnique({
              where: { id: documentId },
              select: { metadata: true },
            })).metadata as object,
            scanResult: metadata,
          },
        }),
      },
    });

    this.logger.log(`Document ${documentId} scan status updated to ${status}`);
  }

  private getOwnerType(role: UserRole): OwnerType {
    switch (role) {
      case UserRole.PATIENT:
        return OwnerType.PATIENT;
      case UserRole.PRESCRIBER:
        return OwnerType.PRESCRIBER;
      default:
        return OwnerType.STAFF;
    }
  }

  private canAccessDocument(
    document: any,
    userId: string,
    userRole: UserRole,
  ): boolean {
    // Owners can always access their documents
    if (document.ownerId === userId) {
      return true;
    }

    // Staff roles have broader access
    if ([UserRole.OPS, UserRole.BILLING, UserRole.COMPLIANCE_ADMIN].includes(userRole)) {
      return true;
    }

    return false;
  }

  private getMimeTypeFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}
