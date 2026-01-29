import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, headers } = request;

    // Generate or use existing request ID
    const requestId =
      (headers['x-request-id'] as string) || uuidv4();
    request.headers['x-request-id'] = requestId;

    const userAgent = headers['user-agent'] || 'unknown';
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';

    const now = Date.now();

    // Log request
    this.logger.log(
      JSON.stringify({
        type: 'request',
        requestId,
        method,
        url,
        ip,
        userAgent: userAgent.substring(0, 100),
        ...(method !== 'GET' && body && Object.keys(body).length > 0
          ? { body: this.sanitizeBody(body) }
          : {}),
      }),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.log(
            JSON.stringify({
              type: 'response',
              requestId,
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - now;

          this.logger.error(
            JSON.stringify({
              type: 'error',
              requestId,
              method,
              url,
              error: error.message,
              duration: `${duration}ms`,
            }),
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = [
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'mfaSecret',
      'nir',
      'carteVitaleNumber',
    ];

    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
