import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      shopId,
      status,
    } = query;

    const where: any = {
      status: status || ProductStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (shopId) where.shopId = shopId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const orderBy: any = {};
    if (sortBy === 'price') orderBy.price = sortOrder;
    else if (sortBy === 'rating') orderBy.rating = sortOrder;
    else if (sortBy === 'sold') orderBy.sold = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        ...paginate(page, limit),
        include: {
          shop: { select: { id: true, name: true, slug: true, city: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginatedResponse(products, total, page, limit);
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            city: true,
            rating: true,
            totalSales: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { reviews: true, wishlistItems: true } },
      },
    });

    if (!product || product.status === ProductStatus.DELETED) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(shopId: string, dto: CreateProductDto) {
    const baseSlug = slugify(dto.name, { lower: true, strict: true });
    const slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;

    const product = await this.prisma.product.create({
      data: {
        shopId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        comparePrice: dto.comparePrice,
        stock: dto.stock,
        weight: dto.weight,
        images: dto.images || [],
        tags: dto.tags || [],
        status: dto.status || ProductStatus.DRAFT,
        variants: dto.variants
          ? { create: dto.variants }
          : undefined,
      },
      include: { variants: true },
    });

    return product;
  }

  async update(id: string, shopId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, shopId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { variants, ...updateData } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.price !== undefined && { price: updateData.price }),
        ...(updateData.comparePrice !== undefined && { comparePrice: updateData.comparePrice }),
        ...(updateData.stock !== undefined && { stock: updateData.stock }),
        ...(updateData.weight !== undefined && { weight: updateData.weight }),
        ...(updateData.images && { images: updateData.images }),
        ...(updateData.tags && { tags: updateData.tags }),
        ...(updateData.status && { status: updateData.status }),
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, shopId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, shopId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
    });
  }

  async getShopProducts(shopId: string, query: ProductQueryDto) {
    return this.findAll({ ...query, shopId, status: undefined });
  }

  async getFeaturedProducts(limit = 10) {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE, stock: { gt: 0 } },
      orderBy: { sold: 'desc' },
      take: limit,
      include: {
        shop: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async updateStock(productId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
        sold: { increment: quantity },
      },
    });
  }
}
