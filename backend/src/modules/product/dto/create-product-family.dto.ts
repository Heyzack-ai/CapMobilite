import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@common/enums';

export class CreateProductFamilyDto {
  @ApiProperty({ description: 'Product family name (must be unique)' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: ProductCategory,
    description: 'Product category',
    example: ProductCategory.MANUAL_WHEELCHAIR,
  })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ description: 'Description of the product family' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the product family is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
