import {
  IsOptional,
  IsEnum,
  IsString,
  IsDecimal,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClaimStatus, GatewayType } from '@common/enums';

export class UpdateClaimDto {
  @ApiPropertyOptional({
    description: 'Claim status',
    enum: ClaimStatus,
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiPropertyOptional({
    description: 'Gateway reference ID',
    example: 'GW-2024-123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gatewayRef?: string;

  @ApiPropertyOptional({
    description: 'Billing gateway type',
    enum: GatewayType,
  })
  @IsOptional()
  @IsEnum(GatewayType)
  gatewayType?: GatewayType;

  @ApiPropertyOptional({
    description: 'Rejection code from CPAM',
    example: 'REJ-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rejectionCode?: string;

  @ApiPropertyOptional({
    description: 'Rejection reason from CPAM',
    example: 'Missing prescription document',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
