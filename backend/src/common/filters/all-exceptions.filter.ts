import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any[];
    requestId: string;
    timestamp: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    const timestamp = new Date().toISOString();

    let status: number;
    let code: string;
    let message: string;
    let details: any[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCode(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        code = responseObj.code || this.getErrorCode(status);
        details = responseObj.details || responseObj.errors;

        // Handle class-validator errors
        if (Array.isArray(message)) {
          details = message.map((msg) => ({
            message: msg,
          }));
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'SYS_INTERNAL_ERROR';

      // Log the actual error for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      code = 'SYS_UNKNOWN_ERROR';
    }

    const errorResponse: ErrorResponse = {
      error: {
        code,
        message,
        ...(details && { details }),
        requestId,
        timestamp,
      },
    };

    // Log error for monitoring
    this.logger.error(
      JSON.stringify({
        requestId,
        method: request.method,
        url: request.url,
        status,
        code,
        message,
        ...(status >= 500 && exception instanceof Error
          ? { stack: exception.stack }
          : {}),
      }),
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const statusCodeMap: Record<number, string> = {
      400: 'VAL_BAD_REQUEST',
      401: 'AUTH_UNAUTHORIZED',
      403: 'AUTHZ_FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'BIZ_UNPROCESSABLE',
      429: 'RATE_LIMITED',
      500: 'SYS_INTERNAL_ERROR',
      503: 'SYS_SERVICE_UNAVAILABLE',
    };

    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
