import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    const timestamp = new Date().toISOString();

    let status: number;
    let code: string;
    let message: string;

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE_ENTRY';
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `A record with this ${target} already exists`;
        break;

      case 'P2003':
        // Foreign key constraint failure
        status = HttpStatus.BAD_REQUEST;
        code = 'FOREIGN_KEY_VIOLATION';
        message = 'Referenced record does not exist';
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = 'Record not found';
        break;

      case 'P2014':
        // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        code = 'RELATION_VIOLATION';
        message = 'The required relation is violated';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = 'DATABASE_ERROR';
        message = 'A database error occurred';
        this.logger.error(
          `Prisma error ${exception.code}: ${exception.message}`,
        );
    }

    response.status(status).json({
      error: {
        code,
        message,
        requestId,
        timestamp,
      },
    });
  }
}
