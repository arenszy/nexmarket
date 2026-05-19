import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true,
            comparePrice: true, images: true, stock: true,
            status: true,
            shop: { select: { id: true, name: true, slug: true } },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = items.reduce((sum, item) => {
      const price = item.variant?.price ? Number(item.variant.price) : Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    return { items, subtotal, itemCount: items.length };
  }

  async addItem(userId: string, dto: { productId: string; variantId?: string; quantity: number }) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.status !== 'ACTIVE') throw new NotFoundException('Product not found');

    const stock = dto.variantId
      ? (await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } }))?.stock ?? 0
      : product.stock;

    if (stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId_variantId: { userId, productId: dto.productId, variantId: dto.variantId ?? null } },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
        include: { product: true, variant: true },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId: dto.productId, variantId: dto.variantId, quantity: dto.quantity },
      include: { product: true, variant: true },
    });
  }

  async updateItem(id: string, userId: string, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    if (quantity <= 0) return this.removeItem(id, userId);
    return this.prisma.cartItem.update({ where: { id }, data: { quantity } });
  }

  async removeItem(id: string, userId: string) {
    const item = await this.prisma.cartItem.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id } });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: 'Cart cleared' };
  }
}
