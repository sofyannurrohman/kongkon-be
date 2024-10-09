import { Injectable } from '@nestjs/common';
import { ChannelWrapper } from 'amqp-connection-manager';
import { AmqpConnectionManager } from './rabbitmq.provider';

@Injectable()
export class RabbitMQConsumerService {
  constructor(private readonly connectionManager: AmqpConnectionManager) {
    this.listenForTransactionPaidEvents();
  }

  private async listenForTransactionPaidEvents() {
    const channel: ChannelWrapper = this.connectionManager.createChannel(
      (channel) => {
        return channel.consume('transaction-paid-queue', async (message) => {
          const event = JSON.parse(message.content.toString());

          // 1. Process the "" event
          console.log('Transaction Paid Event Received:', event);

          // 2. Acknowledge the message
          channel.ack(message);
        });
      },
    );
  }
}
