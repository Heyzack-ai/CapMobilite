import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
  IsObject,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSize } from '@common/enums';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product family ID' })
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiPropertyOptional({ description: 'Stock Keeping Unit (unique identifier)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: ProductSize, description: 'Product size' })
  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @ApiPropertyOptional({
    description: 'Product specifications as JSON object',
    example: { weight: 15, seatWidth: 45, foldable: true },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Maximum user weight in kg' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxUserWeight?: number;

  @ApiPropertyOptional({ description: 'Whether product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
