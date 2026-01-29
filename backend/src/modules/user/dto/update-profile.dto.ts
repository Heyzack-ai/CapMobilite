import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContactPreference } from '@common/enums';

export class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ default: 'FR' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}

export class EmergencyContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;
}

export class UpdatePatientProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ enum: ContactPreference })
  @IsOptional()
  @IsEnum(ContactPreference)
  contactPreference?: ContactPreference;

  @ApiPropertyOptional({ type: EmergencyContactDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}

export class UpdateNirDto {
  @ApiPropertyOptional({ description: '15-digit French NIR' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  nir?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carteVitaleNumber?: string;

  @ApiPropertyOptional({ description: 'Current password for verification' })
  @IsString()
  password: string;
}
