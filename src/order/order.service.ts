import { Inject, Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';
import { CreateOrderDto } from './dto/create_order.dto';
@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_REPOSITORY') private readonly orderRepository: typeof Order,
    private readonly rabbitMQService: RabbitMQProducerService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.create({
      ...createOrderDto, // Set status as 'pending' when order is initially created
    });

    return order;
  }

  async markTransactionAsPaid(orderId: number, transactionId: string) {
    // 1. Update order status to "paid" (business logic here)
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    order.status = 'paid';
    await order.save();

    // 2. Publish the "transaction.paid" event to RabbitMQ
    const eventPayload = {
      order_id: orderId,
      transaction_id: transactionId,
      status: 'paid',
      customer_id: order.customer_id,
      partner_id: order.partner_id,
      amount: order.total_amount,
    };

    await this.rabbitMQService.publishTransactionPaidEvent(eventPayload);
  }

  // async processPayment(orderId: string, paymentInfo: any): Promise<void> {
  //   // Process payment using the transaction service
  //   const paymentResult =
  //     await this.transactionService.processPayment(paymentInfo);

  //   if (paymentResult.success) {
  //     // Update the order status to 'paid'
  //     await this.updateOrderStatus(orderId, 'paid');

  //     // Trigger the driver matching event after payment
  //     const order = await this.orderRepository.findByPk(orderId);
  //     await this.triggerDriverMatch(order);
  //   }
  // }

  async findOrderById(orderId: number): Promise<Order> {
    return this.orderRepository.findByPk(orderId);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    // Find the order and update its status
    const order = await this.orderRepository.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    await order.save();
  }

  async triggerDriverMatch(order: Order): Promise<void> {
    // Publish an event to the RabbitMQ to start driver matching
    const driverMatchPayload = {
      orderId: order.id,
      merchantId: order.merchant_id,
      location: {
        latitude: order.from_location.coordinates[1], // Latitude is at index 1
        longitude: order.from_location.coordinates[0], // Longitude is at index 0
      },
    };

    await this.rabbitMQService.publish(
      'order-events-exchange', // Exchange name
      'driver.match', // Routing key
      driverMatchPayload, // Message to send
    );

    console.log('Driver match event published:', driverMatchPayload);
  }

  // async matchDriver(merchantId: string, radiusInMeters: number): Promise<any> {
  //   const nearbyDrivers = await this.partnerService.findNearbyDrivers(
  //     merchantId,
  //     radiusInMeters,
  //   );

  //   if (nearbyDrivers.length === 0) {
  //     throw new Error('No nearby drivers found');
  //   }

  //   // Randomly select a driver
  //   const randomDriverId =
  //     nearbyDrivers[Math.floor(Math.random() * nearbyDrivers.length)];

  //   // Notify the selected driver via RabbitMQ
  //   await this.client.emit('driver_matched', {
  //     driverId: randomDriverId,
  //     merchantId,
  //   });

  //   return { message: 'Driver matched successfully', driverId: randomDriverId };
  // }
  // async createAndMatchDriver(createOrderDto: CreateOrderDto): Promise<Order> {
  //   // Start a transaction in case something fails
  //   const transaction = await this.sequelize.transaction();

  //   try {
  //     // Create a new order
  //     const newOrder = await this.orderRepository.create(
  //       {
  //         customer_id: createOrderDto.customerId,
  //         partner_id: createOrderDto.partnerId,
  //         status: 'pending',
  //         from_location: createOrderDto.fromLocation, // Expecting GeoJSON or similar
  //         to_location: createOrderDto.toLocation,
  //         total_amount: createOrderDto.totalAmount,
  //         order_type: createOrderDto.orderType,
  //         work_date: createOrderDto.workDate,
  //       },
  //       { transaction },
  //     );

  //     // Find nearby drivers
  //     const nearbyDriverId = await this.partnerService.findNearbyDrivers(
  //       createOrderDto.partnerId,
  //       createOrderDto.radiusInMeters,
  //     );

  //     if (!nearbyDriverId) {
  //       throw new Error('No drivers available nearby');
  //     }

  //     // Update order with matched driver
  //     newOrder.partner_id = nearbyDriverId;
  //     await newOrder.save({ transaction });

  //     // Commit the transaction if everything is successful
  //     await transaction.commit();
  //     return newOrder;
  //   } catch (error) {
  //     // Rollback in case of failure
  //     await transaction.rollback();
  //     throw error;
  //   }
  // }
}
