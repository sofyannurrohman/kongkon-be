import { forwardRef, Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { transactionsProviders } from './transaction.provider';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { OrderModule } from 'src/order/order.module';
import { OrderService } from 'src/order/order.service';
import { ordersProviders } from 'src/order/order.provider';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/user/user.module';
import { UsersService } from 'src/user/user.service';
import { usersProviders } from 'src/user/user.provider';
import { WalletModule } from 'src/wallet/wallet.module';
import { UserInRolesService } from 'src/user-in-roles/user-in-roles.service';
import { RolesService } from 'src/roles/roles.service';
import { UserInRolesModule } from 'src/user-in-roles/user-in-roles.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    RabbitmqModule,
    OrderModule,
    HttpModule,
    forwardRef(() => OrderModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UserInRolesModule), // Add forwardRef here
    forwardRef(() => RolesModule),
    WalletModule,
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    ...transactionsProviders,
    OrderService,
    ...ordersProviders,
    UsersService,
    ...usersProviders,
  ],
  exports: [TransactionService, ...transactionsProviders],
})
export class TransactionModule {}
