import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QuoteService } from './quote.service';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  CreateLineItemDto,
  RejectQuoteDto,
  QuoteResponseDto,
  QuoteListResponseDto,
  QuoteLineItemResponseDto,
} from './dto';
import { CurrentUser, JwtPayload, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { UserRole, QuoteStatus } from '@common/enums';

@ApiTags('Quotes')
@ApiBearerAuth()
@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Create a new quote for a case' })
  @ApiResponse({
    status: 201,
    description: 'Quote created successfully',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - OPS only' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async createQuote(
    @Body() dto: CreateQuoteDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.createQuote(dto, user.sub, user.role as UserRole);
  }

  @Get()
  @ApiOperation({ summary: 'List quotes with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of quotes',
    type: QuoteListResponseDto,
  })
  @ApiQuery({
    name: 'caseId',
    required: false,
    description: 'Filter by case ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: QuoteStatus,
    description: 'Filter by status',
  })
  async listQuotes(
    @Query() query: PaginationQueryDto,
    @Query('caseId') caseId?: string,
    @Query('status') status?: QuoteStatus,
    @CurrentUser() user?: JwtPayload,
  ): Promise<QuoteListResponseDto> {
    return this.quoteService.listQuotes(user!.sub, user!.role as UserRole, {
      ...query,
      caseId,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote details' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote details',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async getQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.getQuote(id, user.sub, user.role as UserRole);
  }

  @Patch(':id')
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Update quote details (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote updated',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Quote not in DRAFT status' })
  @ApiResponse({ status: 403, description: 'Forbidden - OPS only' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async updateQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.updateQuote(id, dto, user.sub, user.role as UserRole);
  }

  @Post(':id/line-items')
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Add a line item to the quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 201,
    description: 'Line item added',
    type: QuoteLineItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Quote not in DRAFT status' })
  @ApiResponse({ status: 403, description: 'Forbidden - OPS only' })
  @ApiResponse({ status: 404, description: 'Quote, Product, or LPPR item not found' })
  async addLineItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLineItemDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteLineItemResponseDto> {
    return this.quoteService.addLineItem(id, dto, user.sub, user.role as UserRole);
  }

  @Delete(':id/line-items/:itemId')
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a line item from the quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiParam({ name: 'itemId', description: 'Line item ID' })
  @ApiResponse({ status: 200, description: 'Line item removed' })
  @ApiResponse({ status: 400, description: 'Quote not in DRAFT status' })
  @ApiResponse({ status: 403, description: 'Forbidden - OPS only' })
  @ApiResponse({ status: 404, description: 'Quote or line item not found' })
  async removeLineItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    return this.quoteService.removeLineItem(id, itemId, user.sub, user.role as UserRole);
  }

  @Post(':id/submit')
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quote to patient for approval' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote submitted for approval',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Quote not in DRAFT status or has no line items' })
  @ApiResponse({ status: 403, description: 'Forbidden - OPS only' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async submitQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.submitQuote(id, user.sub, user.role as UserRole);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve the quote (patient or authorized staff)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote approved',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Quote not pending approval or expired' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to approve' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async approveQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.approveQuote(id, user.sub, user.role as UserRole);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject the quote (patient or authorized staff)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote rejected',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Quote not pending approval' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to reject' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async rejectQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectQuoteDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuoteResponseDto> {
    return this.quoteService.rejectQuote(id, dto, user.sub, user.role as UserRole);
  }
}
