import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUrlOptions {
  bucket: string;
  key: string;
  contentType?: string;
  expiresIn?: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly buckets: { documents: string; generated: string };

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('s3.endpoint') || 'http://localhost:4566';
    const region = this.configService.get<string>('s3.region') || 'eu-west-1';
    const accessKeyId = this.configService.get<string>('s3.accessKey') || 'localstack';
    const secretAccessKey = this.configService.get<string>('s3.secretKey') || 'localstack';

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for LocalStack
    });

    this.buckets = {
      documents: this.configService.get<string>('s3.buckets.documents') || 'axtech-documents-dev',
      generated: this.configService.get<string>('s3.buckets.generated') || 'axtech-generated-dev',
    };
  }

  async getPresignedUploadUrl(options: PresignedUrlOptions): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: options.bucket || this.buckets.documents,
      Key: options.key,
      ContentType: options.contentType || 'application/octet-stream',
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn || 3600, // 1 hour default
    });

    this.logger.debug(`Generated presigned upload URL for key: ${options.key}`);
    return url;
  }

  async getPresignedDownloadUrl(options: PresignedUrlOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: options.bucket || this.buckets.documents,
      Key: options.key,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn || 3600, // 1 hour default
    });

    this.logger.debug(`Generated presigned download URL for key: ${options.key}`);
    return url;
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket || this.buckets.documents,
      Key: key,
    });

    await this.client.send(command);
    this.logger.debug(`Deleted object: ${key} from bucket: ${bucket}`);
  }

  async objectExists(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket || this.buckets.documents,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Try to list objects (limited) to verify connectivity
      const command = new HeadObjectCommand({
        Bucket: this.buckets.documents,
        Key: 'health-check-test',
      });

      // We expect this to fail with NotFound, which is fine
      await this.client.send(command).catch((err) => {
        if (err.name !== 'NotFound') {
          throw err;
        }
      });

      return true;
    } catch (error) {
      this.logger.error('S3 health check failed', error);
      return false;
    }
  }

  getBucketName(type: 'documents' | 'generated'): string {
    return this.buckets[type];
  }
}
