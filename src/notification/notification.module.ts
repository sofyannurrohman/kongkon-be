import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { OrderModule } from 'src/order/order.module';
import { OrderService } from 'src/order/order.service';
import { ordersProviders } from 'src/order/order.provider';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { NotificationGateway } from './notification.gateway';
import { HttpModule } from '@nestjs/axios';
import { transactionsProviders } from 'src/transaction/transaction.provider';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UsersModule } from 'src/user/user.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { RedisModule } from 'src/redis/redis.module';

import { CacheModule } from '@nestjs/cache-manager';
import { CartModule } from 'src/cart/cart.module';
import { CartItemModule } from 'src/cart_item/cart.module';
@Module({
  imports: [
    forwardRef(() => OrderModule),
    forwardRef(() => TransactionModule),
    forwardRef(() => UsersModule),
    forwardRef(() => CartModule),
    forwardRef(() => CartItemModule),
    WalletModule,
    RabbitmqModule,
    HttpModule,
    RedisModule,
    CacheModule.register(),
  ],
  providers: [
    NotificationGateway,
    NotificationService,
    OrderService,
    ...ordersProviders,
    ...transactionsProviders,
  ],
  exports: [NotificationGateway],
})
export class NotificationModule {}
