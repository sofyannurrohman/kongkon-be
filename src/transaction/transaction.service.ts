import { Inject, Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private readonly transactionRepository: typeof Transaction,
    private readonly rabbitMQService: RabbitMQProducerService,
    private readonly orderService: OrderService,
  ) {}
  async handleMidtransNotification(notification: any) {
    const { order_id, transaction_status } = notification;
    console.log(notification);

    // Fetch the corresponding transaction from your database using order_id
    const transaction = await this.transactionRepository.findOne({
      where: { order_id: order_id },
    });

    if (!transaction) {
      throw new Error(
        `Transaction not found for order ID: ${transaction.order_id}`,
      );
    }

    // Handle different transaction statuses
    if (transaction_status === 'capture') {
      transaction.status = 'paid';
    } else if (transaction_status === 'settlement') {
      transaction.status = 'settled';
    } else if (transaction_status === 'pending') {
      transaction.status = 'pending';
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel'
    ) {
      transaction.status = 'failed';
    } else if (transaction_status === 'expire') {
      transaction.status = 'expired';
    }

    await transaction.save();

    const order = await this.orderService.findOrderById(transaction.order_id);
    if (order) {
      order.status = transaction.status;
      await order.save();
    }
  }
  async processPayment(orderId: number): Promise<void> {
    // Payment processing logic here (e.g., communicating with a payment gateway)
    // Let's assume that the payment is successful for now.

    // If payment is successful
    const message = {
      orderId,
      status: 'paid',
    };

    try {
      // Update the order status to 'paid'
      await this.orderService.updateOrderStatus(orderId, 'paid');

      // Trigger driver matching process
      const order = await this.orderService.findOne(orderId); // You may need a method like findOrderById in OrderService
      await this.orderService.triggerDriverMatch(order);

      // Publish the payment confirmation message to the queue
      await this.rabbitMQService.publishPaymentConfirmation(message);

      console.log(
        'Payment processed and driver matching triggered for order:',
        orderId,
      );
    } catch (error) {
      console.error(`Error processing payment for order ID: ${orderId}`, error);
      throw new Error('Error processing payment.');
    }
  }

  async findTransactionByOrderID(orderID: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { order_id: orderID },
    });
    return transaction;
  }
  async findById(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    return transaction;
  }
  async findAll(): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.findAll();
    return transactions;
  }
  async delete(id: number): Promise<boolean> {
    const result = await this.transactionRepository.destroy({ where: { id } });
    return result > 0;
  }
}
