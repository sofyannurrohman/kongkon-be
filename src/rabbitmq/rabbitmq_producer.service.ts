import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQProducerService {
  constructor(
    // @Inject('AMQP_CONNECTION')
    // private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitMQService: AmqpConnection,
  ) {}

  async publishTransactionPaidEvent(eventPayload: any) {
    console.log('Publishing transaction paid event:', eventPayload); // Log the payload

    // Publish the message to the exchange with the routing key
    await this.rabbitMQService.publish(
      'order-events-exchange',
      'transaction.paid',
      eventPayload,
    );
    console.log('Transaction paid event published successfully.');
  }
  async publishPaymentConfirmation(message: any) {
    console.log('Publishing payment confirmation:', message); // Log the payload

    await this.rabbitMQService.publish(
      'order-events-exchange', // Exchange name
      'payment.confirmation', // Routing key for payment confirmation
      message, // Message payload
    );
    console.log('Payment confirmation published successfully.');
  }
  async publishDriverMatchEvent(eventPayload: any) {
    console.log('Publishing driver match event:', eventPayload);
    await this.rabbitMQService.publish(
      'order-events-exchange',
      'driver.match',
      eventPayload,
    );
  }
  async publish(
    exchange: string,
    routingKey: string,
    message: any,
  ): Promise<void> {
    await this.rabbitMQService.publish(exchange, routingKey, message);
  }
  //  {
  //   this.channelWrapper = this.connectionManager.createChannel({
  //     json: true, // Automatically stringify/parse JSON messages
  //     setup: async (channel) => {
  //       await channel.assertExchange('order-events-exchange', 'direct', {
  //         durable: true,
  //       });

  //       // Consumer Queue Setup
  //       await channel.assertQueue('transaction-paid-queue', { durable: true });
  //       await channel.bindQueue(
  //         'transaction-paid-queue',
  //         'order-events-exchange',
  //         'transaction.paid',
  //       );
  //     },
  //   });
  // }

  // async publishTransactionPaidEvent(eventPayload: any) {
  //   console.log('Publishing transaction paid event:', eventPayload); // Log the payload

  //   await this.channelWrapper.publish(
  //     'order-events-exchange', // Exchange name
  //     'transaction.paid', // Routing key
  //     eventPayload, // Message payload
  //   );
  // }
}
