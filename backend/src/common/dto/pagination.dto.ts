import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor for pagination',
    example: 'eyJpZCI6IjEyMyJ9',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class PaginationMeta {
  cursor?: string;
  hasMore: boolean;
  limit: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMeta;

  constructor(data: T[], pagination: PaginationMeta) {
    this.data = data;
    this.pagination = pagination;
  }
}
