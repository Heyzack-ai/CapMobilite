import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ssw0rd!' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Indicates if MFA is required' })
  mfaRequired: boolean;

  @ApiProperty({ description: 'MFA challenge token (if MFA required)', required: false })
  mfaToken?: string;

  @ApiProperty({ description: 'Access token (if MFA not required)', required: false })
  accessToken?: string;

  @ApiProperty({ description: 'Refresh token (if MFA not required)', required: false })
  refreshToken?: string;

  @ApiProperty({ description: 'Token expiration time in seconds', required: false })
  expiresIn?: number;
}
