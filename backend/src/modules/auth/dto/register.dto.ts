import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd!',
    description: 'Min 8 chars, must contain uppercase, lowercase, number, and special char',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @ApiPropertyOptional({
    example: '+33612345678',
    description: 'Phone number in E.164 format',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone must be in E.164 format (e.g., +33612345678)',
  })
  phone?: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '1960-05-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptTerms: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptHealthDataConsent: boolean;
}
