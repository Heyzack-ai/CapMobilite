import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory, ProductSize } from '@common/enums';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by product family ID' })
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiPropertyOptional({
    enum: ProductCategory,
    description: 'Filter by product category',
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    enum: ProductSize,
    description: 'Filter by product size',
  })
  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @ApiPropertyOptional({ description: 'Search by product name or SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Include product family details',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeFamily?: boolean;

  @ApiPropertyOptional({
    description: 'Include LPPR mappings',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeLpprMappings?: boolean;
}

export class ProductFamilyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ProductCategory,
    description: 'Filter by category',
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export class LpprItemQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search by code or label' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter to show only currently valid items',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  validOnly?: boolean;
}

export class CreateProductLpprMappingDto {
  @ApiProperty({ description: 'LPPR Item ID to map to this product' })
  @IsUUID()
  lpprItemId: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary LPPR code for the product',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
