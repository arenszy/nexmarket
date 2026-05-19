import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { orderItemId: string; rating: number; comment?: string; images?: string[] }) {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { id: dto.orderItemId, order: { userId, status: 'DELIVERED' } },
    });
    if (!orderItem) throw new BadRequestException('Cannot review this item');

    const existing = await this.prisma.review.findUnique({ where: { orderItemId: dto.orderItemId } });
    if (existing) throw new BadRequestException('Already reviewed');

    const review = await this.prisma.review.create({
      data: { userId, productId: orderItem.productId, orderItemId: dto.orderItemId, ...dto },
    });

    // Update product rating
    const stats = await this.prisma.review.aggregate({
      where: { productId: orderItem.productId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: orderItem.productId },
      data: { rating: stats._avg.rating || 0, reviewCount: stats._count },
    });

    return review;
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);
    return { data: reviews, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
