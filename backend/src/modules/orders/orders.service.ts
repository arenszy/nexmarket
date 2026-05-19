import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Validate address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Get cart items
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId, id: { in: dto.cartItemIds } },
      include: {
        product: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('No valid cart items found');
    }

    // Validate stock
    for (const item of cartItems) {
      const availableStock = item.variant
        ? item.variant.stock
        : item.product.stock;
      if (availableStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const price = item.variant?.price
        ? Number(item.variant.price)
        : Number(item.product.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      return {
        shopId: item.product.shopId,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant
          ? `${item.variant.name}: ${item.variant.value}`
          : null,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        imageUrl: item.product.images[0] || null,
      };
    });

    const shippingCost = dto.shippingCost || 0;
    const discount = dto.discount || 0;
    const total = subtotal + shippingCost - discount;

    // Generate order number
    const orderNumber = `SC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: dto.addressId,
          subtotal,
          shippingCost,
          discount,
          total,
          notes: dto.notes,
          items: { create: orderItems },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING_PAYMENT,
              note: 'Order created',
            },
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      // Update stock
      for (const item of cartItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              sold: { increment: item.quantity },
            },
          });
        }
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { id: { in: dto.cartItemIds } },
      });

      return newOrder;
    });

    return order;
  }

  async findUserOrders(userId: string, page = 1, limit = 10, status?: OrderStatus) {
    const where: any = { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true, slug: true } },
            },
          },
          payment: { select: { status: true, provider: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginatedResponse(orders, total, page, limit);
  }

  async findOne(id: string, userId: string, role: Role) {
    const where: any = { id };
    if (role === Role.BUYER) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
            shop: { select: { id: true, name: true, slug: true } },
            review: true,
          },
        },
        address: true,
        payment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    userId: string,
    role: Role,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // Validate status transitions
    this.validateStatusTransition(order.status, dto.status, role);

    const updateData: any = { status: dto.status };

    if (dto.status === OrderStatus.PAID) updateData.paidAt = new Date();
    if (dto.status === OrderStatus.SHIPPED) updateData.shippedAt = new Date();
    if (dto.status === OrderStatus.DELIVERED) updateData.deliveredAt = new Date();
    if (dto.status === OrderStatus.CANCELLED) updateData.cancelledAt = new Date();

    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: updateData,
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status,
          note: dto.note,
        },
      }),
    ]);

    return updatedOrder;
  }

  async getSellerOrders(shopId: string, page = 1, limit = 10, status?: OrderStatus) {
    const where: any = {
      items: { some: { shopId } },
    };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
        include: {
          items: {
            where: { shopId },
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
          address: true,
          payment: { select: { status: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginatedResponse(orders, total, page, limit);
  }

  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
    role: Role,
  ) {
    const sellerTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.PACKED],
      [OrderStatus.PACKED]: [OrderStatus.SHIPPED],
    };

    const buyerTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    };

    const adminTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CANCELLED, OrderStatus.PAID],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      [OrderStatus.PROCESSING]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
      [OrderStatus.PACKED]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
    };

    let allowed: OrderStatus[] = [];
    if (role === Role.SELLER) allowed = sellerTransitions[current] || [];
    else if (role === Role.BUYER) allowed = buyerTransitions[current] || [];
    else if (role === Role.ADMIN) allowed = adminTransitions[current] || [];

    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${next}`,
      );
    }
  }
}
