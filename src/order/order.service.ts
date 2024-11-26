import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from './order.entity';

import * as midtransClient from 'midtrans-client';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';
import { CreateOrderDto } from './dto/create_order.dto';
import { UpdateOrderDto } from './dto/update_order.dto';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { HttpService } from '@nestjs/axios';
import { DistanceDto } from './dto/distance_estimate.dto';
import { Transaction } from 'src/transaction/transaction.entity';
import { UsersService } from 'src/user/user.service';
import { WalletService } from 'src/wallet/wallet.service';
import { CartService } from 'src/cart/cart.service';
import { CartItemService } from 'src/cart_item/cart.service';
import { CreateCartItemDto } from 'src/cart_item/dto/create_item_cart.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class OrderService {
  private googleMapsApiKey: string;
  private midtransSnap;
  constructor(
    @Inject('ORDER_REPOSITORY') private readonly orderRepository: typeof Order,
    @Inject('TRANSACTION_REPOSITORY')
    private transactionModel: typeof Transaction,
    private userService: UsersService,
    private cartService: CartService,
    private cartItemService: CartItemService,
    private walletService: WalletService,
    private readonly rabbitMQService: RabbitMQProducerService,
    private httpService: HttpService, // Inject HttpService
    private configService: ConfigService, // Inject ConfigService
  ) {
    this.googleMapsApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
    // Setup Midtrans client
    this.midtransSnap = new midtransClient.Snap({
      isProduction: false,
      serverKey: 'SB-Mid-server-SfTZphN2_lPVv9YGOo38V9jV', // Replace with your server key from Midtrans Dashboard
      clientKey: 'SB-Mid-client-40nK8xJmDkJQMULJ', // Replace with your client key
    });
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const cartItem = new CreateCartItemDto();
    cartItem.items = createOrderDto.items;

    const userCartItem = await this.cartItemService.addToCartItem(
      createOrderDto.customer_id,
      cartItem,
    );
    const data = new DistanceDto();
    data.from_lat = createOrderDto.from_location.coordinates[1];
    data.from_lng = createOrderDto.from_location.coordinates[0];
    data.to_lat = createOrderDto.to_location.coordinates[1];
    data.to_lng = createOrderDto.to_location.coordinates[0];

    const partnerProfit = await this.estimateCost(data);
    const merchantProfit = 5000;
    let date = createOrderDto.work_date;
    if (createOrderDto.work_date == null) {
      date = new Date();
    }
    const order = await this.orderRepository.create({
      work_date: date,
      ...createOrderDto,
      partner_id: 'pending',
      status: 'pending',
      total_amount:
        userCartItem.cart.total_amount + partnerProfit + merchantProfit,
      partner_profit: partnerProfit,
      merchant_profit: merchantProfit,
      cart_id: userCartItem.cart.id,
    });
    const user = await this.userService.findOne(order.customer_id);
    const transactionParams = {
      transaction_details: {
        order_id: order.id,
        gross_amount: order.total_amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone_number,
      },
    };

    const midtransResponse =
      await this.midtransSnap.createTransaction(transactionParams);

    await this.transactionModel.create({
      order_id: order.id,
      user_id: order.customer_id,
      code: midtransResponse.token,
      status: 'pending',
      amount: order.total_amount,
    });

    return {
      order,
      paymentUrl: midtransResponse.redirect_url,
    };
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1Rad) *
        Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in kilometers
  }

  async estimateCost(data: DistanceDto): Promise<number> {
    const distance = this.calculateDistance(
      data.from_lat,
      data.from_lng,
      data.to_lat,
      data.to_lng,
    );
    console.log(distance);
    // Define your cost logic here
    const baseFare = 2000; // Base fare
    const costPerKm = 5000; // Cost per kilometer
    const totalCost = baseFare + distance * costPerKm;

    return Math.round(totalCost);
  }

  // async calculateCostAndUpdateOrder(
  //   orderId: number,
  //   fromLocation: Point, // Merchant's location
  //   toLocation: Point, // Customer's location
  // ): Promise<Order> {
  //   const distance = await this.calculateDistance(fromLocation, toLocation);
  //   const deliveryCost = this.calculateDeliveryCost(distance);
  //   const { merchantProfit, driverCommission } =
  //     this.calculateProfitAndCommission(deliveryCost);

  //   const updateOrderDto: UpdateOrderDto = {
  //     status: 'estimated',
  //     total_amount: deliveryCost,
  //     merchant_profit: merchantProfit,
  //     partner_profit: driverCommission,
  //   };

  //   return await this.updateOrder(orderId, updateOrderDto);
  // }

  // async calculateDistance(
  //   fromLocation: Point,
  //   toLocation: Point,
  // ): Promise<number> {
  //   const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${fromLocation.coordinates[1]},${fromLocation.coordinates[0]}&destinations=${toLocation.coordinates[1]},${toLocation.coordinates[0]}&key=${this.googleMapsApiKey}`;

  //   const response = await this.httpService.get(url).toPromise();
  //   const data = response.data;

  //   if (data.status !== 'OK' || !data.rows || data.rows.length === 0) {
  //     throw new BadRequestException('Error calculating distance');
  //   }

  //   const distanceInMeters = data.rows[0].elements[0].distance.value; // Distance in meters
  //   return distanceInMeters / 1000; // Convert to kilometers
  // }

  // calculateDeliveryCost(distance: number): number {
  //   const basePrice = 50; // Base price for delivery
  //   const pricePerKm = 10; // Cost per kilometer
  //   return basePrice + distance * pricePerKm;
  // }

  // calculateProfitAndCommission(deliveryCost: number): {
  //   merchantProfit: number;
  //   driverCommission: number;
  // } {
  //   const driverCommissionPercentage = 0.2;
  //   const merchantProfitPercentage = 0.8;

  //   const driverCommission = deliveryCost * driverCommissionPercentage;
  //   const merchantProfit = deliveryCost * merchantProfitPercentage;

  //   return { merchantProfit, driverCommission };
  // }

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

  async findOrderById(orderId: number): Promise<any> {
    const order = await this.orderRepository.findByPk(orderId);
    const cart = await this.cartService.findByID(order.cart_id);
    return {
      order: order,
      cart: cart,
    };
  }
  async findOne(orderId: number): Promise<any> {
    const order = await this.orderRepository.findByPk(orderId);
    return order;
  }
  async findAll(): Promise<any> {
    const orders = await this.orderRepository.findAll();
    return orders;
  }
  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.findAll({
      attributes: {
        exclude: [
          'from_location',
          'to_location',
          'merchant_profit',
          'partner_profit',
        ],
      },
      where: {
        customer_id: userId,
      },
      order: [['createdAt', 'DESC']], // Order by 'createdAt' in descending order (latest first)
    });
  }
  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update the order with the provided DTO
    await order.update(updateOrderDto);

    return order;
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

  async completeOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findByPk(orderId);

    if (!order) {
      throw new HttpException(
        `Order with ID ${orderId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    // Mark order as complete in the database
    order.status = 'completed';
    const updatedOrder = await order.save();

    // Publish the order complete event
    const completeOrderPayload = { orderId: order.id };
    await this.rabbitMQService.publish(
      'order-events-exchange',
      'order.complete',
      completeOrderPayload,
    );

    console.log('Order complete event published:', completeOrderPayload);
    return updatedOrder;
  }

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findByPk(orderId);

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    if (order.status != 'paid' || 'canceled') {
      throw new Error(
        `Order ${orderId} cant be canceled because order status is ${order.status}`,
      );
    }

    // Update order status to 'canceled'
    order.status = 'canceled';
    await order.save();

    // Refund the total amount to the user's wallet
    const customer = await this.userService.findOne(order.customer_id);
    if (!customer) {
      throw new Error(`Customer not found for ID: ${order.customer_id}`);
    }

    await this.walletService.addBalance(customer.id, order.total_amount);

    return order;
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
  async delete(id: number): Promise<boolean> {
    const result = await this.orderRepository.destroy({ where: { id } });
    return result > 0;
  }
}
