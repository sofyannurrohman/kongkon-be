import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { transactionsProviders } from './transaction.provider';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { OrderModule } from 'src/order/order.module';
import { OrderService } from 'src/order/order.service';
import { ordersProviders } from 'src/order/order.provider';

@Module({
  imports: [RabbitmqModule, OrderModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    ...transactionsProviders,
    OrderService,
    ...ordersProviders,
  ],
})
export class TransactionModule {}
