import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER_CLIENT',
      useFactory: () => {
        const client = new Redis({
          host: 'localhost',
          port: 6379,
        });

        client.on('error', (error) => {
          console.error('Publisher Redis error:', error);
        });

        return client;
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER_CLIENT',
      useFactory: () => {
        const subscriber = new Redis({
          host: 'localhost',
          port: 6379,
        });

        subscriber.on('error', (error) => {
          console.error('Subscriber Redis error:', error);
        });

        return subscriber;
      },
    },
  ],
  exports: ['REDIS_PUBLISHER_CLIENT', 'REDIS_SUBSCRIBER_CLIENT'],
})
export class RedisModule {}
