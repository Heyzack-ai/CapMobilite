import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductFamilyDto,
  CreateLpprItemDto,
  ProductQueryDto,
  ProductFamilyQueryDto,
  LpprItemQueryDto,
  CreateProductLpprMappingDto,
} from './dto';
import { Public, Roles } from '@common/decorators';
import { UserRole } from '@common/enums';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ============================================================================
  // PRODUCT FAMILY ENDPOINTS
  // ============================================================================

  @Public()
  @Get('product-families')
  @ApiOperation({ summary: 'List all product families' })
  @ApiResponse({ status: 200, description: 'Product families retrieved successfully' })
  async getProductFamilies(@Query() query: ProductFamilyQueryDto) {
    return this.productService.getProductFamilies(query);
  }

  @Get('product-families/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product family by ID' })
  @ApiParam({ name: 'id', description: 'Product family UUID' })
  @ApiResponse({ status: 200, description: 'Product family retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  async getProductFamilyById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductFamilyById(id);
  }

  @Post('product-families')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Create a new product family (OPS/ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Product family created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Product family with this name already exists' })
  async createProductFamily(@Body() dto: CreateProductFamilyDto) {
    return this.productService.createProductFamily(dto);
  }

  // ============================================================================
  // PRODUCT ENDPOINTS
  // ============================================================================

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'List all products with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productService.getProducts(query);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID with full details' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductById(id);
  }

  @Post('products')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Create a new product (OPS/ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product family not found' })
  @ApiResponse({ status: 409, description: 'Product with this SKU already exists' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Patch('products/:id')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @ApiOperation({ summary: 'Update a product (OPS/ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product or product family not found' })
  @ApiResponse({ status: 409, description: 'Product with this SKU already exists' })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a product (OPS/ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.deleteProduct(id);
  }

  // ============================================================================
  // LPPR ITEM ENDPOINTS
  // ============================================================================

  @Public()
  @Get('lppr-items')
  @ApiOperation({ summary: 'List all LPPR items (French reimbursement codes)' })
  @ApiResponse({ status: 200, description: 'LPPR items retrieved successfully' })
  async getLpprItems(@Query() query: LpprItemQueryDto) {
    return this.productService.getLpprItems(query);
  }

  @Get('lppr-items/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get LPPR item by ID' })
  @ApiParam({ name: 'id', description: 'LPPR item UUID' })
  @ApiResponse({ status: 200, description: 'LPPR item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'LPPR item not found' })
  async getLpprItemById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getLpprItemById(id);
  }

  @Post('lppr-items')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN, UserRole.BILLING)
  @ApiOperation({ summary: 'Create a new LPPR item (OPS/ADMIN/BILLING only)' })
  @ApiResponse({ status: 201, description: 'LPPR item created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'LPPR item with this code already exists' })
  async createLpprItem(@Body() dto: CreateLpprItemDto) {
    return this.productService.createLpprItem(dto);
  }

  // ============================================================================
  // PRODUCT-LPPR MAPPING ENDPOINTS
  // ============================================================================

  @Get('products/:id/lppr-mappings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all LPPR mappings for a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'LPPR mappings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductLpprMappings(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductLpprMappings(id);
  }

  @Post('products/:id/lppr-mappings')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN, UserRole.BILLING)
  @ApiOperation({ summary: 'Map a product to an LPPR code (OPS/ADMIN/BILLING only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 201, description: 'Product-LPPR mapping created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product or LPPR item not found' })
  @ApiResponse({ status: 409, description: 'Mapping already exists' })
  async createProductLpprMapping(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductLpprMappingDto,
  ) {
    return this.productService.createProductLpprMapping(id, dto);
  }

  @Delete('products/:productId/lppr-mappings/:lpprItemId')
  @ApiBearerAuth()
  @Roles(UserRole.OPS, UserRole.COMPLIANCE_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a product-LPPR mapping (OPS/ADMIN only)' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiParam({ name: 'lpprItemId', description: 'LPPR item UUID' })
  @ApiResponse({ status: 200, description: 'Mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mapping not found' })
  async deleteProductLpprMapping(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('lpprItemId', ParseUUIDPipe) lpprItemId: string,
  ) {
    return this.productService.deleteProductLpprMapping(productId, lpprItemId);
  }

  // ============================================================================
  // REIMBURSEMENT CALCULATION
  // ============================================================================

  @Get('products/:id/reimbursement')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate reimbursement for a product based on primary LPPR code' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Reimbursement calculation returned' })
  @ApiResponse({ status: 400, description: 'Product does not have a primary LPPR mapping' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async calculateReimbursement(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.calculateReimbursement(id);
  }
}
