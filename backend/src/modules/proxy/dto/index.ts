import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  Length,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProxyRelationshipType, ProxyStatus } from '@common/enums';

export class InviteProxyDto {
  @ApiProperty({
    example: 'proxy@example.com',
    description: 'Email of the person being invited as proxy',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: ProxyRelationshipType,
    example: ProxyRelationshipType.FAMILY,
    description: 'Relationship between patient and proxy',
  })
  @IsEnum(ProxyRelationshipType)
  relationship: ProxyRelationshipType;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Optional expiration date for the proxy relationship',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-consent-document',
    description: 'ID of the uploaded consent document',
  })
  @IsOptional()
  @IsUUID()
  consentDocumentId?: string;
}

export class AcceptProxyInvitationDto {
  @ApiProperty({
    example: 'invitation-token',
    description: 'Token received in the proxy invitation',
  })
  @IsString()
  @Length(10, 100)
  token: string;
}

export class SwitchPatientContextDto {
  @ApiProperty({
    example: 'uuid-of-patient-profile',
    description: 'Patient profile ID to switch context to',
  })
  @IsUUID()
  patientId: string;
}

export class UpdateProxyDto {
  @ApiPropertyOptional({
    example: '2026-06-30',
    description: 'New expiration date for the proxy relationship',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    enum: ProxyStatus,
    description: 'New status for the proxy relationship',
  })
  @IsOptional()
  @IsEnum(ProxyStatus)
  status?: ProxyStatus;
}

export class ProxyRelationshipResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  patientId: string;

  @ApiProperty({ example: 'Jean Dupont' })
  patientName: string;

  @ApiProperty({ example: 'uuid' })
  proxyUserId: string;

  @ApiProperty({ example: 'Marie Dupont' })
  proxyName: string;

  @ApiProperty({ enum: ProxyRelationshipType })
  relationship: ProxyRelationshipType;

  @ApiProperty({ enum: ProxyStatus })
  status: ProxyStatus;

  @ApiProperty({ example: '2025-01-29T10:00:00Z' })
  validFrom: Date;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  validUntil?: Date | null;

  @ApiProperty({ example: '2025-01-29T10:00:00Z' })
  createdAt: Date;
}

export class ProxyInvitationResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'proxy@example.com' })
  email: string;

  @ApiProperty({ enum: ProxyRelationshipType })
  relationship: ProxyRelationshipType;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: '2025-01-29T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-30T10:00:00Z' })
  expiresAt: Date;
}

export class PatientsListResponseDto {
  @ApiProperty({ type: [ProxyRelationshipResponseDto] })
  data: ProxyRelationshipResponseDto[];

  @ApiProperty({ example: 2 })
  total: number;
}

export class ProxiesListResponseDto {
  @ApiProperty({ type: [ProxyRelationshipResponseDto] })
  data: ProxyRelationshipResponseDto[];

  @ApiProperty({ example: 1 })
  total: number;
}
