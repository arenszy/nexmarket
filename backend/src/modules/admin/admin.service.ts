import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalSellers, totalProducts, totalOrders, revenueResult, pendingShops] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'BUYER' } }),
        this.prisma.user.count({ where: { role: 'SELLER' } }),
        this.prisma.product.count({ where: { status: 'ACTIVE' } }),
        this.prisma.order.count(),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        this.prisma.shop.count({ where: { status: 'PENDING' } }),
      ]);

    const recentOrders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: { select: { status: true, provider: true } },
      },
    });

    return {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.amount || 0,
      pendingShops,
      recentOrders,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  }

  async getShops(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    const [shops, total] = await Promise.all([
      this.prisma.shop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { products: true } } },
      }),
      this.prisma.shop.count({ where }),
    ]);
    return { data: shops, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateShopStatus(id: string, status: string) {
    return this.prisma.shop.update({ where: { id }, data: { status: status as any } });
  }

  async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: { select: { status: true, provider: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getBanners() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createBanner(dto: { title: string; imageUrl: string; linkUrl?: string; sortOrder?: number }) {
    return this.prisma.banner.create({ data: dto });
  }

  async updateBanner(id: string, dto: any) {
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async deleteBanner(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner deleted' };
  }
}
