export * from './create-quote.dto';
export * from './update-quote.dto';
export * from './create-line-item.dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuoteStatus } from '@common/enums';

// Response DTOs
export class QuoteLineItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  lpprItemId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  lineTotal: number;

  @ApiProperty()
  sortOrder: number;

  @ApiPropertyOptional()
  product?: {
    id: string;
    sku: string;
    name: string;
  };

  @ApiPropertyOptional()
  lpprItem?: {
    id: string;
    code: string;
    label: string;
    maxPrice: number | null;
  };
}

export class QuoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quoteNumber: string;

  @ApiProperty()
  caseId: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  lpprCoverage: number;

  @ApiProperty()
  patientRemainder: number;

  @ApiProperty({ enum: QuoteStatus })
  status: QuoteStatus;

  @ApiPropertyOptional()
  pdfDocumentId?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: string;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ type: [QuoteLineItemResponseDto] })
  lineItems?: QuoteLineItemResponseDto[];

  @ApiPropertyOptional()
  case?: {
    id: string;
    caseNumber: string;
    status: string;
  };

  @ApiPropertyOptional()
  notes?: string;
}

export class QuoteListResponseDto {
  @ApiProperty({ type: [QuoteResponseDto] })
  data: QuoteResponseDto[];

  @ApiProperty()
  pagination: {
    cursor?: string;
    hasMore: boolean;
    limit: number;
  };
}
