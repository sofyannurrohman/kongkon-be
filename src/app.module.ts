import { Module, ValidationPipe } from '@nestjs/common';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { PartnerModule } from './partner/partner.module';
import { OrderModule } from './order/order.module';
import { ItemModule } from './item/item.module';
import { DatabaseModule } from './db/database.module';
import { UsersModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MerchantModule } from './merchant/merchant.module';
import { VariantModule } from './variant/variant.module';
import { APP_PIPE } from '@nestjs/core';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from './redis/redis.module';
import { NotificationModule } from './notification/notification.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { CartItemModule } from './cart_item/cart.module';
import { CartModule } from './cart/cart.module';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Your RabbitMQ URL
          queue: 'order_queue', // Define the order queue
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    WalletModule,
    UsersModule,
    TransactionModule,
    PartnerModule,
    OrderModule,
    ItemModule,
    AuthModule,
    MerchantModule,
    VariantModule,
    RedisModule,
    NotificationModule,
    RabbitmqModule,
    CartModule,
    CartItemModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
