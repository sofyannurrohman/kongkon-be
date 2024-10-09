import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification_gateway.provider';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly orderService: OrderService,
  ) {}
  @RabbitSubscribe({
    exchange: 'order-matched-exchange',
    routingKey: 'order.matched',
    queue: 'order-matched-queue',
  })
  async handleOrderMatchedMessage(msg: any) {
    const { orderId, driverId } = msg;

    try {
      // Retrieve order, customer, and merchant details from the database
      const order = await this.orderService.findOrderById(orderId);

      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return;
      }

      // Send notifications in parallel
      await Promise.all([
        this.notificationGateway.notifyCustomer(order.customer_id, {
          orderId: order.id,
          driver: order.partner_id,
        }),
        this.notificationGateway.notifyMerchant(order.merchant_id, {
          orderId: order.id,
          driver: order.partner_id,
        }),
        this.notificationGateway.notifyDriver(driverId, {
          orderId: order.id,
          customer: order.customer_id,
        }),
      ]);
      console.log(`Customer notified for order ID: ${order.id}`);
      console.log(`Merchant notified for order ID: ${order.id}`);
      console.log(`Driver ${driverId} notified for order ID: ${order.id}`);
    } catch (error) {
      console.error(
        `Error handling order match message for order ID: ${orderId}`,
        error,
      );
    }
  }
}
