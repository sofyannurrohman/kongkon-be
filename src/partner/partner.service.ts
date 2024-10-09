import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { Sequelize } from 'sequelize-typescript';
import { MerchantService } from 'src/merchant/merchant.service';
import { QueryTypes } from 'sequelize';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';
@Injectable()
export class PartnerService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private merchantService: MerchantService,
    private rabbitMQService: RabbitMQProducerService, // Ensure correct injection
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
    console.log('Received driver match event:', msg);

    const { orderId, merchantId, location } = msg;
    try {
      // Find nearby drivers
      const matchedDrivers = await this.findNearbyDrivers(
        merchantId,
        2000, // Example radius in meters
      );
      if (!matchedDrivers || matchedDrivers.length === 0) {
        console.log(`No nearby drivers found for order ID: ${orderId}`);
        return; // Exit if no drivers are found
      }
      if (matchedDrivers && matchedDrivers.length > 0) {
        console.log(`Matched drivers:`, matchedDrivers);

        // Publish the "order.matched" event to RabbitMQ for notification service to handle
        const orderMatchedPayload = {
          orderId, // Pass the order ID
          driverId: matchedDrivers[0], // Pass the matched driver ID
        };

        await this.rabbitMQService.publish(
          'order-matched-exchange', // Exchange name
          'order.matched', // Routing key for the matched event
          orderMatchedPayload, // The message payload
        );
        console.log('Order matched event published:', orderMatchedPayload);
      } else {
        console.log(`No nearby drivers found for order ID: ${orderId}`);
      }
    } catch (error) {
      console.error(
        `Error while matching driver for order ID: ${orderId}`,
        error,
      );
    }
  }
}

interface NearbyDriver {
  driver_id: string;
  distance: number;
}
