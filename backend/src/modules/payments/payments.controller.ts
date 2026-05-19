import { Controller, Post, Get, Body, Param, UseGuards, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Request } from 'express';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('midtrans/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initiate Midtrans Snap payment' })
  initiateMidtrans(@Param('orderId') orderId: string, @GetUser('id') userId: string) {
    return this.paymentsService.initiateMidtrans(orderId, userId);
  }

  @Post('stripe/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initiate Stripe payment intent' })
  initiateStripe(@Param('orderId') orderId: string, @GetUser('id') userId: string) {
    return this.paymentsService.initiateStripe(orderId, userId);
  }

  @Post('webhook/midtrans')
  @ApiOperation({ summary: 'Midtrans payment webhook' })
  midtransWebhook(@Body() notification: any) {
    return this.paymentsService.handleMidtransWebhook(notification);
  }

  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe payment webhook' })
  stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, sig);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get payment info for an order' })
  getPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }
}
