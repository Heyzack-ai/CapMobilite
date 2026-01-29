export { CreateClaimDto } from './create-claim.dto';
export { UpdateClaimDto } from './update-claim.dto';
export { CreateClaimReturnDto } from './create-claim-return.dto';
export { CreatePaymentDto } from './create-payment.dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ClaimStatus,
  GatewayType,
  ClaimDocumentRole,
  ReturnFileType,
  PaymentMethod,
} from '@common/enums';

// Response DTOs

export class ClaimDocumentResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  documentId: string;

  @ApiProperty({ enum: ClaimDocumentRole })
  documentRole: ClaimDocumentRole;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Document details' })
  document?: {
    id: string;
    filename: string;
    mimeType: string;
    documentType: string;
  };
}

export class ClaimReturnResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ enum: ReturnFileType })
  returnType: ReturnFileType;

  @ApiProperty({ example: 'returns/2024/01/claim-123/noemie.xml' })
  rawFileStorageKey: string;

  @ApiPropertyOptional()
  parsedData?: Record<string, any>;

  @ApiProperty()
  receivedAt: Date;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class PaymentResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 450.0 })
  amount: number;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'PAY-2024-001234' })
  reference?: string;

  @ApiProperty()
  createdAt: Date;
}

export class ClaimResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  caseId: string;

  @ApiProperty({ example: 'CLM-2024-00001' })
  claimNumber: string;

  @ApiPropertyOptional({ example: 'GW-2024-123456' })
  gatewayRef?: string;

  @ApiProperty({ enum: GatewayType })
  gatewayType: GatewayType;

  @ApiProperty({ enum: ClaimStatus })
  status: ClaimStatus;

  @ApiPropertyOptional()
  submittedAt?: Date;

  @ApiProperty({ example: 1250.0 })
  totalAmount: number;

  @ApiPropertyOptional({ example: 450.0 })
  paidAmount?: number;

  @ApiPropertyOptional({ example: 800.0, description: 'Remaining balance to be paid' })
  remainingBalance?: number;

  @ApiPropertyOptional({ example: 'REJ-001' })
  rejectionCode?: string;

  @ApiPropertyOptional({ example: 'Missing prescription document' })
  rejectionReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Related case details' })
  case?: {
    id: string;
    caseNumber: string;
    status: string;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };

  @ApiPropertyOptional({ type: [ClaimDocumentResponseDto] })
  claimDocuments?: ClaimDocumentResponseDto[];

  @ApiPropertyOptional({ type: [ClaimReturnResponseDto] })
  claimReturns?: ClaimReturnResponseDto[];

  @ApiPropertyOptional({ type: [PaymentResponseDto] })
  payments?: PaymentResponseDto[];
}

export class AttachDocumentDto {
  @ApiProperty({
    description: 'Document ID to attach to the claim',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  documentId: string;

  @ApiProperty({
    description: 'Role of the document in the claim',
    enum: ClaimDocumentRole,
    example: ClaimDocumentRole.PRESCRIPTION,
  })
  documentRole: ClaimDocumentRole;
}

import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { ClaimDocumentRole as DocRole } from '@common/enums';

export class AttachDocumentRequestDto {
  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @IsNotEmpty()
  @IsEnum(DocRole)
  documentRole: DocRole;
}
