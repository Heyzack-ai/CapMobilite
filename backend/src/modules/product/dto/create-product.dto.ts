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
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSize } from '@common/enums';

export class CreateProductDto {
  @ApiProperty({ description: 'Product family ID' })
  @IsUUID()
  familyId: string;

  @ApiProperty({ description: 'Stock Keeping Unit (unique identifier)' })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @MaxLength(200)
  name: string;

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

  @ApiPropertyOptional({ description: 'Whether product is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
