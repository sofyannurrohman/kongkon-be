import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ProcessPaymentDto } from './dto/payment_procced.dto';
import { PaymentNotificationDto } from './dto/payment_notification.dto';
import { Response } from 'express';
import { WebResponse } from 'src/model/web.model';
import { Transaction } from './transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('process-payment')
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
  ): Promise<void> {
    const { orderId } = processPaymentDto;

    try {
      // Call the service to process the payment
      console.log(orderId);
      await this.transactionService.processPayment(orderId);
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
        this.transactionService.processPayment(transaction.order_id);
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
  @Get()
  async findAll(): Promise<WebResponse<Transaction[]>> {
    const transactions = await this.transactionService.findAll();
    return {
      status: 'success',
      code: 200,
      message: 'Successfuly get all transaction',
      data: transactions,
    };
  }
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<WebResponse<Transaction[]>> {
    const transaction = await this.transactionService.findById(id);
    const deleted = await this.transactionService.delete(id);
    if (!deleted) {
      throw new HttpException('User  not found', HttpStatus.NOT_FOUND);
    }

    return { message: `Transaction ${transaction.id} successfully deleted` };
  }
}
