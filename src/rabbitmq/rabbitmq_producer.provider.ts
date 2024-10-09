import { connect } from 'amqp-connection-manager';

export const rabbitMQProducerProviders = [
  {
    provide: 'AMQP_CONNECTION',
    useFactory: () => {
      // Create a new connection manager
      return connect(['amqp://localhost']); // Update with your RabbitMQ connection URL
    },
  },
];
