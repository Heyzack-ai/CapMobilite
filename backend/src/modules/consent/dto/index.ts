import {
  IsEnum,
  IsString,
  IsOptional,
  IsIP,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentType } from '@common/enums';

export class CreateConsentDto {
  @ApiProperty({
    enum: ConsentType,
    example: ConsentType.HEALTH_DATA,
    description: 'Type of consent being given',
  })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty({
    example: '1.0.0',
    description: 'Version of the consent text being agreed to',
  })
  @IsString()
  @Length(1, 20)
  version: string;

  @ApiPropertyOptional({
    example: 'sha256-hash-of-consent-text',
    description: 'SHA-256 hash of the consent text for verification',
  })
  @IsOptional()
  @IsString()
  textHash?: string;
}

export class WithdrawConsentDto {
  @ApiPropertyOptional({
    example: 'User requested data deletion',
    description: 'Reason for withdrawing consent',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}

export class ConsentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ enum: ConsentType })
  consentType: ConsentType;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'sha256-hash' })
  textHash: string;

  @ApiProperty({ example: '2025-01-29T10:00:00Z' })
  consentedAt: Date;

  @ApiPropertyOptional({ example: '2025-02-15T10:00:00Z' })
  withdrawnAt?: Date | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class ConsentListResponseDto {
  @ApiProperty({ type: [ConsentResponseDto] })
  data: ConsentResponseDto[];

  @ApiProperty({ example: 3 })
  total: number;
}
