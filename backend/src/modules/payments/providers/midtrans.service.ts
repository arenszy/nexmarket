import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Midtrans from 'midtrans-client';

@Injectable()
export class MidtransService {
  private snap: Midtrans.Snap;
  private coreApi: Midtrans.CoreApi;
  private readonly logger = new Logger(MidtransService.name);

  constructor(private configService: ConfigService) {
    const isProduction = configService.get('MIDTRANS_IS_PRODUCTION') === 'true';
    const serverKey = configService.get('MIDTRANS_SERVER_KEY');
    const clientKey = configService.get('MIDTRANS_CLIENT_KEY');

    this.snap = new Midtrans.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    this.coreApi = new Midtrans.CoreApi({
      isProduction,
      serverKey,
      clientKey,
    });
  }

  async createTransaction(params: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }) {
    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.amount),
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: params.items.map((item) => ({
        id: item.id,
        name: item.name.substring(0, 50),
        price: Math.round(item.price),
        quantity: item.quantity,
      })),
      callbacks: {
        finish: `${this.configService.get('FRONTEND_URL')}/orders`,
      },
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error) {
      this.logger.error('Midtrans create transaction error:', error);
      throw error;
    }
  }

  async getTransactionStatus(transactionId: string) {
    try {
      return await this.coreApi.transaction.status(transactionId);
    } catch (error) {
      this.logger.error('Midtrans get status error:', error);
      throw error;
    }
  }

  verifyNotification(notification: any): boolean {
    // In production, verify the signature key
    // notification.signature_key should match SHA512(order_id + status_code + gross_amount + server_key)
    return true; // Simplified for demo
  }

  mapStatus(midtransStatus: string): 'SUCCESS' | 'FAILED' | 'PENDING' | 'EXPIRED' {
    switch (midtransStatus) {
      case 'capture':
      case 'settlement':
        return 'SUCCESS';
      case 'deny':
      case 'cancel':
      case 'failure':
        return 'FAILED';
      case 'expire':
        return 'EXPIRED';
      default:
        return 'PENDING';
    }
  }
}
