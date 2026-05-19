import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MidtransService } from './providers/midtrans.service';
import { StripeService } from './providers/stripe.service';
import { PaymentProvider, OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private midtrans: MidtransService,
    private stripe: StripeService,
  ) {}

  async initiateMidtrans(orderId: string, userId: string) {
    const order = await this.getOrderForPayment(orderId, userId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const items = order.items.map((item) => ({
      id: item.productId,
      name: item.productName,
      price: Number(item.price),
      quantity: item.quantity,
    }));

    const result = await this.midtrans.createTransaction({
      orderId: order.orderNumber,
      amount: Number(order.total),
      customerName: user.name,
      customerEmail: user.email,
      items,
    });

    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      update: { snapToken: result.token, paymentUrl: result.redirectUrl, status: 'PENDING' },
      create: {
        orderId,
        provider: PaymentProvider.MIDTRANS,
        amount: order.total,
        currency: 'IDR',
        snapToken: result.token,
        paymentUrl: result.redirectUrl,
      },
    });

    return { snapToken: result.token, redirectUrl: result.redirectUrl, payment };
  }

  async initiateStripe(orderId: string, userId: string) {
    const order = await this.getOrderForPayment(orderId, userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const paymentIntent = await this.stripe.createPaymentIntent({
      amount: Number(order.total),
      currency: 'usd',
      orderId: order.orderNumber,
      customerEmail: user.email,
    });

    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      update: { paymentToken: paymentIntent.id, status: 'PENDING' },
      create: {
        orderId,
        provider: PaymentProvider.STRIPE,
        amount: order.total,
        currency: 'USD',
        paymentToken: paymentIntent.id,
      },
    });

    return { clientSecret: paymentIntent.client_secret, payment };
  }

  async handleMidtransWebhook(notification: any) {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber: notification.order_id },
    });
    if (!order) return;

    const status = this.midtrans.mapStatus(notification.transaction_status);

    await this.prisma.payment.update({
      where: { orderId: order.id },
      data: {
        status,
        transactionId: notification.transaction_id,
        paidAt: status === 'SUCCESS' ? new Date() : undefined,
        metadata: notification,
      },
    });

    if (status === 'SUCCESS') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
      });
      await this.prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.PAID, note: 'Payment confirmed via Midtrans' },
      });
    }
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: any;

    try {
      event = this.stripe.constructWebhookEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const payment = await this.prisma.payment.findFirst({
        where: { paymentToken: paymentIntent.id },
      });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', paidAt: new Date(), transactionId: paymentIntent.id },
        });
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID, paidAt: new Date() },
        });
      }
    }
  }

  async getPaymentByOrder(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  private async getOrderForPayment(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order is not pending payment');
    }
    return order;
  }
}
