import { forwardRef, Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ordersProviders } from './order.provider';
import { MerchantModule } from 'src/merchant/merchant.module';
import { PartnerModule } from 'src/partner/partner.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';
import { transactionsProviders } from 'src/transaction/transaction.provider';
import { UsersModule } from 'src/user/user.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    forwardRef(() => NotificationModule),
    MerchantModule,
    PartnerModule,
    RabbitmqModule,
    HttpModule, // Add HttpModule for HttpService
    ConfigModule.forRoot(),
    WalletModule,
    CartModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, ...ordersProviders, ...transactionsProviders],
  exports: [OrderService, ...ordersProviders], // Make sure to include OrderService here
})
export class OrderModule {}
