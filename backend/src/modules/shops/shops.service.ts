import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { name: string; description?: string; city?: string; province?: string }) {
    const existing = await this.prisma.shop.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('You already have a shop');

    const baseSlug = slugify(dto.name, { lower: true, strict: true });
    const slug = `${baseSlug}-${uuidv4().slice(0, 6)}`;

    const shop = await this.prisma.shop.create({
      data: { userId, slug, ...dto, status: 'ACTIVE' },
    });

    await this.prisma.user.update({ where: { id: userId }, data: { role: Role.SELLER } });
    return shop;
  }

  async findBySlug(slug: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true } },
      },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async findByUserId(userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { userId },
      include: { _count: { select: { products: true, orderItems: true } } },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(userId: string, dto: any) {
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new NotFoundException('Shop not found');
    return this.prisma.shop.update({ where: { userId }, data: dto });
  }

  async getDashboardStats(shopId: string) {
    const [totalProducts, totalOrders, revenueResult, pendingOrders] = await Promise.all([
      this.prisma.product.count({ where: { shopId, status: { not: 'DELETED' } } }),
      this.prisma.orderItem.count({ where: { shopId } }),
      this.prisma.orderItem.aggregate({
        where: { shopId, order: { status: { in: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] } } },
        _sum: { subtotal: true },
      }),
      this.prisma.order.count({
        where: { items: { some: { shopId } }, status: 'PAID' },
      }),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.subtotal || 0,
      pendingOrders,
    };
  }
}
