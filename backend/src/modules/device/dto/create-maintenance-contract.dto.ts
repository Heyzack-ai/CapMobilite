import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContractType } from '@common/enums';

export class CreateMaintenanceContractDto {
  @ApiProperty({
    description: 'Type of maintenance contract',
    enum: ContractType,
    example: ContractType.ELECTRIC,
  })
  @IsEnum(ContractType)
  @IsNotEmpty()
  contractType: ContractType;

  @ApiProperty({
    description: 'Contract start date',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Contract renewal/end date',
    example: '2025-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  renewalDate: string;

  @ApiProperty({
    description: 'Annual forfait amount in EUR',
    example: 250.0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  annualForfait: number;
}
