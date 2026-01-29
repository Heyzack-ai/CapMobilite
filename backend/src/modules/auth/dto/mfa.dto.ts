import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyMfaDto {
  @ApiProperty({ description: 'MFA challenge token from login' })
  @IsString()
  mfaToken: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class EnableMfaDto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code to verify setup' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class MfaSetupResponseDto {
  @ApiProperty({ description: 'TOTP secret for authenticator app' })
  secret: string;

  @ApiProperty({ description: 'QR code data URL for authenticator app' })
  qrCodeUrl: string;
}
