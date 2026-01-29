import {
  IsString,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecordPartUsageDto {
  @ApiProperty({
    description: 'SKU of the part used',
    example: 'PART-BATT-001',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  partSku: string;

  @ApiProperty({
    description: 'Name/description of the part',
    example: 'Lithium Battery 24V 10Ah',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  partName: string;

  @ApiProperty({
    description: 'Quantity of parts used',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit cost of the part in EUR',
    example: 150.0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitCost: number;
}
