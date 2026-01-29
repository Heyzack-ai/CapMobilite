import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { PaginatedResponseDto, PaginationMeta } from '@common/dto/pagination.dto';
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

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // PRODUCT FAMILY OPERATIONS
  // ============================================================================

  async createProductFamily(dto: CreateProductFamilyDto) {
    // Check for existing family with same name
    const existing = await this.prisma.productFamily.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Product family with name '${dto.name}' already exists`);
    }

    return this.prisma.productFamily.create({
      data: {
        name: dto.name,
        category: dto.category,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async getProductFamilies(query: ProductFamilyQueryDto) {
    const { cursor, limit = 20, category, isActive } = query;

    const where: Prisma.ProductFamilyWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const families = await this.prisma.productFamily.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const hasMore = families.length > limit;
    const data = hasMore ? families.slice(0, -1) : families;

    const pagination: PaginationMeta = {
      cursor: data.length > 0 ? data[data.length - 1].id : undefined,
      hasMore,
      limit,
    };

    return new PaginatedResponseDto(data, pagination);
  }

  async getProductFamilyById(id: string) {
    const family = await this.prisma.productFamily.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!family) {
      throw new NotFoundException(`Product family with ID '${id}' not found`);
    }

    return family;
  }

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  async createProduct(dto: CreateProductDto) {
    // Check if family exists
    const family = await this.prisma.productFamily.findUnique({
      where: { id: dto.familyId },
    });

    if (!family) {
      throw new NotFoundException(`Product family with ID '${dto.familyId}' not found`);
    }

    // Check for existing product with same SKU
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existingProduct) {
      throw new ConflictException(`Product with SKU '${dto.sku}' already exists`);
    }

    return this.prisma.product.create({
      data: {
        familyId: dto.familyId,
        sku: dto.sku,
        name: dto.name,
        size: dto.size,
        specifications: dto.specifications ?? {},
        maxUserWeight: dto.maxUserWeight,
        isActive: dto.isActive ?? true,
      },
      include: {
        family: true,
      },
    });
  }

  async getProducts(query: ProductQueryDto) {
    const {
      cursor,
      limit = 20,
      familyId,
      category,
      size,
      search,
      isActive,
      includeFamily = false,
      includeLpprMappings = false,
    } = query;

    const where: Prisma.ProductWhereInput = {};

    if (familyId) {
      where.familyId = familyId;
    }

    if (category) {
      where.family = { category };
    }

    if (size) {
      where.size = size;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { name: 'asc' },
      include: {
        family: includeFamily,
        lpprMappings: includeLpprMappings
          ? {
              include: {
                lpprItem: true,
              },
            }
          : false,
      },
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, -1) : products;

    const pagination: PaginationMeta = {
      cursor: data.length > 0 ? data[data.length - 1].id : undefined,
      hasMore,
      limit,
    };

    return new PaginatedResponseDto(data, pagination);
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        family: true,
        lpprMappings: {
          include: {
            lpprItem: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    // Check if product exists
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    // If updating familyId, check if family exists
    if (dto.familyId) {
      const family = await this.prisma.productFamily.findUnique({
        where: { id: dto.familyId },
      });

      if (!family) {
        throw new NotFoundException(`Product family with ID '${dto.familyId}' not found`);
      }
    }

    // If updating SKU, check for uniqueness
    if (dto.sku && dto.sku !== existing.sku) {
      const existingWithSku = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (existingWithSku) {
        throw new ConflictException(`Product with SKU '${dto.sku}' already exists`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.familyId && { familyId: dto.familyId }),
        ...(dto.sku && { sku: dto.sku }),
        ...(dto.name && { name: dto.name }),
        ...(dto.size !== undefined && { size: dto.size }),
        ...(dto.specifications && { specifications: dto.specifications }),
        ...(dto.maxUserWeight !== undefined && { maxUserWeight: dto.maxUserWeight }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        family: true,
        lpprMappings: {
          include: {
            lpprItem: true,
          },
        },
      },
    });
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Product deleted successfully' };
  }

  // ============================================================================
  // LPPR ITEM OPERATIONS
  // ============================================================================

  async createLpprItem(dto: CreateLpprItemDto) {
    // Check for existing item with same code
    const existing = await this.prisma.lPPRItem.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`LPPR item with code '${dto.code}' already exists`);
    }

    return this.prisma.lPPRItem.create({
      data: {
        code: dto.code,
        label: dto.label,
        category: dto.category,
        maxPrice: dto.maxPrice,
        maintenanceForfait: dto.maintenanceForfait,
        validFrom: new Date(dto.validFrom),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
  }

  async getLpprItems(query: LpprItemQueryDto) {
    const { cursor, limit = 20, category, search, validOnly = true } = query;

    const where: Prisma.LPPRItemWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { label: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (validOnly) {
      const now = new Date();
      where.validFrom = { lte: now };
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: now } },
      ];
    }

    const items = await this.prisma.lPPRItem.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { code: 'asc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    const pagination: PaginationMeta = {
      cursor: data.length > 0 ? data[data.length - 1].id : undefined,
      hasMore,
      limit,
    };

    return new PaginatedResponseDto(data, pagination);
  }

  async getLpprItemById(id: string) {
    const item = await this.prisma.lPPRItem.findUnique({
      where: { id },
      include: {
        productMappings: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`LPPR item with ID '${id}' not found`);
    }

    return item;
  }

  // ============================================================================
  // PRODUCT-LPPR MAPPING OPERATIONS
  // ============================================================================

  async createProductLpprMapping(productId: string, dto: CreateProductLpprMappingDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    // Verify LPPR item exists
    const lpprItem = await this.prisma.lPPRItem.findUnique({
      where: { id: dto.lpprItemId },
    });

    if (!lpprItem) {
      throw new NotFoundException(`LPPR item with ID '${dto.lpprItemId}' not found`);
    }

    // Check for existing mapping
    const existingMapping = await this.prisma.productLPPRMapping.findUnique({
      where: {
        productId_lpprItemId: {
          productId,
          lpprItemId: dto.lpprItemId,
        },
      },
    });

    if (existingMapping) {
      throw new ConflictException('This product is already mapped to this LPPR item');
    }

    // If setting as primary, unset other primary mappings for this product
    if (dto.isPrimary) {
      await this.prisma.productLPPRMapping.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productLPPRMapping.create({
      data: {
        productId,
        lpprItemId: dto.lpprItemId,
        isPrimary: dto.isPrimary ?? false,
      },
      include: {
        product: true,
        lpprItem: true,
      },
    });
  }

  async getProductLpprMappings(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    return this.prisma.productLPPRMapping.findMany({
      where: { productId },
      include: {
        lpprItem: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { lpprItem: { code: 'asc' } }],
    });
  }

  async deleteProductLpprMapping(productId: string, lpprItemId: string) {
    const mapping = await this.prisma.productLPPRMapping.findUnique({
      where: {
        productId_lpprItemId: {
          productId,
          lpprItemId,
        },
      },
    });

    if (!mapping) {
      throw new NotFoundException('Product-LPPR mapping not found');
    }

    await this.prisma.productLPPRMapping.delete({
      where: {
        productId_lpprItemId: {
          productId,
          lpprItemId,
        },
      },
    });

    return { message: 'Product-LPPR mapping deleted successfully' };
  }

  // ============================================================================
  // REIMBURSEMENT CALCULATION
  // ============================================================================

  async calculateReimbursement(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        lpprMappings: {
          where: { isPrimary: true },
          include: {
            lpprItem: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    const primaryMapping = product.lpprMappings[0];

    if (!primaryMapping) {
      throw new BadRequestException('Product does not have a primary LPPR mapping');
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
      },
      lpprItem: {
        code: primaryMapping.lpprItem.code,
        label: primaryMapping.lpprItem.label,
        maxPrice: primaryMapping.lpprItem.maxPrice,
        maintenanceForfait: primaryMapping.lpprItem.maintenanceForfait,
      },
      reimbursement: {
        maxCoverage: primaryMapping.lpprItem.maxPrice,
        annualMaintenance: primaryMapping.lpprItem.maintenanceForfait,
      },
    };
  }
}
