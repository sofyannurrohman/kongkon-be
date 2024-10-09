import { Body, Controller, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ProcessPaymentDto } from './dto/payment_procced.dto';

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
}
