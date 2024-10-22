import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ProcessPaymentDto } from './dto/payment_procced.dto';
import { PaymentNotificationDto } from './dto/payment_notification.dto';
import { Response } from 'express';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('process-payment')
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
  ): Promise<void> {
    const { orderId, amount } = processPaymentDto;

    try {
      // Call the service to process the payment
      await this.transactionService.processPayment(orderId, amount);
      console.log('Payment processing initiated');
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Payment processing failed');
    }
  }
  @Post('payment-notification')
  async handlePaymentNotification(
    @Body() paymentNotificationDto: PaymentNotificationDto,
    @Res() res: Response,
  ) {
    try {
      await this.transactionService.handleMidtransNotification(
        paymentNotificationDto,
      );
      const transaction =
        await this.transactionService.findTransactionByOrderID(
          paymentNotificationDto.order_id,
        );
      console.log(transaction);
      if (transaction.status === 'paid') {
        this.transactionService.processPayment(
          transaction.order_id,
          transaction.amount,
        );
      }
      return res
        .status(HttpStatus.OK)
        .send('Payment notification received and Start Driver Matched ');
    } catch (error) {
      console.error('Error processing payment notification:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Error processing payment');
    }
  }
}
