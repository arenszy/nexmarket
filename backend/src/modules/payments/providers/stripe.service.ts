import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY', 'sk_test_placeholder'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(params: { amount: number; currency: string; orderId: string; customerEmail: string }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // cents
        currency: params.currency.toLowerCase(),
        metadata: { orderId: params.orderId },
        receipt_email: params.customerEmail,
      });
      return paymentIntent;
    } catch (error) {
      this.logger.error('Stripe create payment intent error:', error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  constructWebhookEvent(payload: Buffer, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  mapStatus(stripeStatus: string): 'SUCCESS' | 'FAILED' | 'PENDING' {
    switch (stripeStatus) {
      case 'succeeded': return 'SUCCESS';
      case 'canceled': return 'FAILED';
      default: return 'PENDING';
    }
  }
}
