import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly rabbitMQService: RabbitMQProducerService,
    private readonly orderService: OrderService,
  ) {}
  async processPayment(orderId: number, amount: number): Promise<void> {
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
      const order = await this.orderService.findOrderById(orderId); // You may need a method like findOrderById in OrderService
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
}
