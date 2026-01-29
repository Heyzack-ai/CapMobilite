import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCaseNoteDto {
  @ApiProperty({
    description: 'Note content',
    example: 'Contacted patient regarding missing documents.',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({
    description: 'Whether the note is internal (staff only) or visible to patient',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
