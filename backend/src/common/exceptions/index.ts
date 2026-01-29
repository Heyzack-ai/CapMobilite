import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(code: string, message: string, status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) {
    super({ code, message }, status);
  }
}

export class AuthenticationException extends HttpException {
  constructor(code: string, message: string) {
    super({ code, message }, HttpStatus.UNAUTHORIZED);
  }
}

export class AuthorizationException extends HttpException {
  constructor(code: string, message: string) {
    super({ code, message }, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundException extends HttpException {
  constructor(resource: string) {
    super({ code: 'NOT_FOUND', message: `${resource} not found` }, HttpStatus.NOT_FOUND);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super({ code: 'CONFLICT', message }, HttpStatus.CONFLICT);
  }
}

export class ValidationException extends HttpException {
  constructor(details: any[]) {
    super(
      { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
      HttpStatus.BAD_REQUEST,
    );
  }
}
