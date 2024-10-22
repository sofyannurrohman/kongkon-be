import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { NotificationGateway } from './notification.gateway';
import { UpdateOrderDto } from 'src/order/dto/update_order.dto';
import { DriverStatusDto } from 'src/partner/dto/driver_status.dto';

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
      const order = await this.orderService.findOrderById(orderId);

      const orderDto = new UpdateOrderDto();
      orderDto.status = 'accepted';
      orderDto.partner_id = driverId;
      await this.orderService.updateOrder(orderId, orderDto);
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

  @RabbitSubscribe({
    exchange: 'order-events-exchange',
    routingKey: 'order.complete',
    queue: 'order-complete-queue',
  })
  async handleCompleteOrderMessage(msg: any) {
    const { orderId } = msg;

    try {
      // Retrieve order details
      const order = await this.orderService.findOrderById(orderId);

      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return;
      }

      // Handle the completion logic, e.g., notify customer, merchant, driver
      await Promise.all([
        this.notificationGateway.notifyCustomer(order.customer_id, {
          message: `Your order ${order.id} is now complete.`,
        }),
        this.notificationGateway.notifyMerchant(order.merchant_id, {
          message: `Order ${order.id} has been successfully completed.`,
        }),
        this.notificationGateway.notifyDriver(order.partner_id, {
          message: `Order ${order.id} has been marked as complete.`,
        }),
      ]);
      this.emitTestNotification();
      console.log(
        `Order completion notifications sent for order ID: ${order.id}`,
      );
    } catch (error) {
      console.error(
        `Error handling complete order for order ID: ${orderId}`,
        error,
      );
    }
  }
  emitTestNotification() {
    this.notificationGateway.server.emit('notification', {
      message: 'Test notification',
    });
  }
  async sendDriverStatusUpdate(
    customerId: string,
    merchantId: string,
    driverStatusDto: DriverStatusDto,
  ) {
    // Notify customer and merchant
    await Promise.all([
      this.notificationGateway.notifyCustomer(customerId, {
        message: `Driver status: ${driverStatusDto.status}`,
        orderId: driverStatusDto.orderId,
      }),
      this.notificationGateway.notifyMerchant(merchantId, {
        message: `Driver status: ${driverStatusDto.status}`,
        orderId: driverStatusDto.orderId,
      }),
    ]);
  }
}
