import { IsUUID, IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GatewayType } from '@common/enums';

export class CreateClaimDto {
  @ApiProperty({
    description: 'Quote ID to create claim from (must be approved)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  quoteId: string;

  @ApiPropertyOptional({
    description: 'Billing gateway type',
    enum: GatewayType,
    default: GatewayType.MANUAL,
  })
  @IsOptional()
  @IsEnum(GatewayType)
  gatewayType?: GatewayType;

  @ApiPropertyOptional({
    description: 'Notes or additional information for the claim',
    example: 'Patient requires expedited processing',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
