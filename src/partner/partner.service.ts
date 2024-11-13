import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { Sequelize } from 'sequelize-typescript';
import { MerchantService } from 'src/merchant/merchant.service';
import { QueryTypes } from 'sequelize';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { OrderService } from 'src/order/order.service';
@Injectable()
export class PartnerService {
  constructor(
    @Inject('REDIS_PUBLISHER_CLIENT') private readonly redisClient: Redis,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private merchantService: MerchantService,
    private rabbitMQService: RabbitMQProducerService, // Ensure correct injection
    private notificationGateway: NotificationGateway,
    private orderService: OrderService,
  ) {}

  async postLocation(driverId: string, latitude: number, longitude: number) {
    const locationKey = `driver:${driverId}:location`;
    const locationData = JSON.stringify({ latitude, longitude });

    await this.redisClient.set(locationKey, locationData, 'EX', 300);
    return { message: 'Location updated successfully' };
  }

  async getLocation(driverId: string) {
    const locationKey = `driver:${driverId}:location`;
    const location = await this.redisClient.get(locationKey);

    if (location) {
      return JSON.parse(location);
    }
    return { message: 'Location not found' };
  }
  async getAllDriversFromRedis(): Promise<
    { driverId: string; latitude: number; longitude: number }[]
  > {
    const driverKeys = await this.redisClient.keys('driver:*:location');

    const drivers = await Promise.all(
      driverKeys.map(async (key) => {
        const locationData = await this.redisClient.get(key);
        const { latitude, longitude } = JSON.parse(locationData);
        const driverId = key.split(':')[1]; // Extract driverId from key
        return { driverId, latitude, longitude };
      }),
    );

    return drivers;
  }
  async findNearbyDrivers(
    merchantId: string,
    radiusInMeters: number,
  ): Promise<string[]> {
    // Get merchant location
    const { latitude: merchantLat, longitude: merchantLong } =
      await this.merchantService.getMerchantLocation(merchantId);

    // Get all drivers from Redis
    const drivers = await this.getAllDriversFromRedis();
    console.log('Drivers from Redis:', drivers); // Log drivers

    // If no drivers are available, return an empty list
    if (drivers.length === 0) {
      return [];
    }

    // Map driver locations to geometry points
    const driverPoints = drivers.map(
      (driver) =>
        `ST_SetSRID(ST_MakePoint(${driver.longitude}, ${driver.latitude}), 4326)`,
    );
    const driverIds = drivers.map((driver) => `'${driver.driverId}'`);

    console.log('Driver Points:', driverPoints); // Log driver points
    console.log('Driver IDs:', driverIds); // Log driver IDs

    try {
      // Use Sequelize instance to run a raw query
      let [results] = await this.sequelize.query<NearbyDriver[]>(
        `
        SELECT driver_id, ST_DistanceSphere(
          ST_MakePoint(${merchantLong}, ${merchantLat}),
          driver_point
        ) AS distance
        FROM (
          SELECT UNNEST(ARRAY[${driverPoints.join(',')}])::GEOMETRY AS driver_point,
                 UNNEST(ARRAY[${driverIds.join(',')}])::TEXT AS driver_id
        ) AS driver_locations
        WHERE ST_DistanceSphere(
          ST_MakePoint(${merchantLong}, ${merchantLat}),
          driver_point
        ) <= ${radiusInMeters}
        ORDER BY driver_id; -- Optional: Order by driver ID for consistent results
        `,
        {
          type: QueryTypes.SELECT, // Specify the query type
        },
      );

      console.log('Query Results:', results); // Log the results

      // Ensure results is defined and is an array before mapping
      if (!Array.isArray(results)) {
        results = results ? [results] : [];
      }

      // Return a list of nearby driver IDs
      return results.map((result) => result.driver_id);
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Error finding nearby drivers.');
    }
  }

  @RabbitSubscribe({
    exchange: 'order-events-exchange',
    routingKey: 'driver.match',
    queue: 'driver-matching-queue',
  })
  async handleDriverMatchEvent(msg: any) {
    const { orderId, merchantId, location } = msg;
    const order = await this.orderService.findOrderById(orderId);
    console.log(`Handling driver match event for order: ${orderId}`);

    try {
      const matchedDrivers = await this.findNearbyDrivers(merchantId, 2000);
      if (!matchedDrivers || matchedDrivers.length === 0) {
        console.log(`No nearby drivers found for order ID: ${orderId}`);
        return;
      }

      while (matchedDrivers.length > 0) {
        const driverId = matchedDrivers.shift(); // Get the next available driver
        console.log(
          `Attempting to notify driver: ${driverId} for order: ${orderId}`,
        );

        try {
          // Step 3: Notify the driver and wait for their response
          const response = await this.notificationGateway.notifyAssignedDriver(
            driverId,
            orderId,
          );

          console.log(
            `Driver ${driverId} response for order ${orderId}: ${response}`,
          );

          if (response === 'accepted') {
            // If the driver accepted, publish to RabbitMQ
            const orderMatchedPayload = { orderId, driverId };
            console.log(
              `Publishing order match to RabbitMQ:`,
              orderMatchedPayload,
            );

            await this.rabbitMQService.publish(
              'order-matched-exchange', // Exchange name
              'order.matched', // Routing key for matched event
              orderMatchedPayload,
            );

            console.log(
              `Order ${orderId} matched successfully with driver ${driverId}`,
            );
            break; // Exit the loop since the order is matched
          } else {
            console.log(`Driver ${driverId} declined the order ${orderId}`);
          }
        } catch (error) {
          if (error === 'timeout') {
            console.log(
              `Driver ${driverId} did not respond in time for order ${orderId}`,
            );
            await this.notificationGateway.notifyCustomer(
              order.customer_id,
              'Tidak ada driver di sekitar lokasi',
            );
          } else {
            console.error(
              `Error notifying driver ${driverId} for order ${orderId}:`,
              error,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error handling driver match event for order ID: ${orderId}`,
        error,
      );
    }
  }

  async handleRematch(orderId: number) {
    console.log(`Handling rematch request for order: ${orderId}`);

    try {
      const order = await this.orderService.findOrderById(orderId);
      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return;
      }

      // Step 1: Find nearby drivers again
      const matchedDrivers = await this.findNearbyDrivers(
        order.merchant_id,
        5000,
      );
      if (!matchedDrivers || matchedDrivers.length === 0) {
        console.log(
          `No drivers available for rematch for order ID: ${orderId}`,
        );
        // Notify the customer that no drivers were found again
        await this.notifyCustomerNoDriver(order.customer_id, orderId);
        return;
      }

      // Step 2: Notify and match driver (same logic as in handleDriverMatchEvent)
      await this.notifyAndMatchDriver(matchedDrivers, String(orderId));
    } catch (error) {
      console.error(`Error handling rematch for order ID: ${orderId}`, error);
    }
  }
  private async notifyCustomerNoDriver(customerId: string, orderId: number) {
    const payload = {
      orderId,
      message: 'No driver found within the initial search.',
      options: ['rematch', 'cancel'], // Options for the customer
    };

    // Use a notification system to inform the customer (Socket.IO, Push Notification, etc.)
    await this.notificationGateway.notifyCustomer(customerId, payload);
  }
  private async notifyAndMatchDriver(
    matchedDrivers: string[],
    orderId: string,
  ) {
    while (matchedDrivers.length > 0) {
      const driverId = matchedDrivers.shift(); // Get the next available driver
      console.log(
        `Attempting to notify driver: ${driverId} for order: ${orderId}`,
      );

      try {
        // Notify the driver and wait for their response
        const response = await this.notificationGateway.notifyAssignedDriver(
          driverId,
          orderId,
        );

        if (response === 'accepted') {
          const orderMatchedPayload = { orderId, driverId };

          // Publish the order match to RabbitMQ
          await this.rabbitMQService.publish(
            'order-matched-exchange',
            'order.matched',
            orderMatchedPayload,
          );

          console.log(
            `Order ${orderId} matched successfully with driver ${driverId}`,
          );
          break; // Exit the loop since the order is matched
        } else {
          console.log(`Driver ${driverId} declined the order ${orderId}`);
        }
      } catch (error) {
        if (error === 'timeout') {
          console.log(
            `Driver ${driverId} did not respond in time for order ${orderId}`,
          );
        } else {
          console.error(
            `Error notifying driver ${driverId} for order ${orderId}:`,
            error,
          );
        }
      }
    }
  }
}

interface NearbyDriver {
  driver_id: string;
  distance: number;
}
