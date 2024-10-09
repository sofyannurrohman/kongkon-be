import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification_gateway.provider';
import { NotificationService } from './notification.service';
import { OrderModule } from 'src/order/order.module';
import { OrderService } from 'src/order/order.service';
import { ordersProviders } from 'src/order/order.provider';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [OrderModule, RabbitmqModule],
  providers: [
    NotificationGateway,
    NotificationService,
    OrderService,
    ...ordersProviders,
  ],
})
export class NotificationModule {}
