import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MidtransService } from './providers/midtrans.service';
import { StripeService } from './providers/stripe.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MidtransService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
