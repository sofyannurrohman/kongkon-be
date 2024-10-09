import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQProducerService } from './rabbitmq_producer.service'; // Adjust the path as necessary

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'order-events-exchange',
          type: 'direct', // Adjust this based on your needs (e.g., 'topic', 'fanout', etc.)
        },
        {
          name: 'order-matched-exchange',
          type: 'direct', // Adjust this based on your needs (e.g., 'topic', 'fanout', etc.)
        },
      ],
      uri: 'amqp://localhost:5672', // Replace with your RabbitMQ connection URI
      // Other RabbitMQ configurations can be added here
    }),
  ],
  providers: [
    RabbitMQProducerService,
    // If you have any additional providers, add them here
  ],
  exports: [RabbitMQProducerService], // Export to use in other services
})
export class RabbitmqModule {}
