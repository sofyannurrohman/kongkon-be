import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost', // your Redis host
          port: 6379, // your Redis port
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'], // Make REDIS_CLIENT available to other modules
})
export class RedisModule {}
