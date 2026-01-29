import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      cursor?: string;
      hasMore: boolean;
      limit: number;
    };
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response already has our structure, return as-is
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }

        // Skip wrapping for certain response types
        if (data === null || data === undefined) {
          return { data: null };
        }

        // Wrap the response
        return { data };
      }),
    );
  }
}
