import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PartnerService } from './partner.service';

@Injectable()
export class DriverMatchingService {
  constructor(private partnerService: PartnerService) {}
  @RabbitSubscribe({
    exchange: 'order-events-exchange',
    routingKey: 'driver.match', // Routing key for driver matching
    queue: 'driver-matching-queue', // Queue name
  })
  async handleDriverMatchEvent(msg: any) {
    console.log('Received driver match event:', msg);
    const { orderId, location } = msg;

    try {
      // Implement the driver matching logic here
      const matchedDriver = await this.partnerService.findNearbyDrivers(
        location,
        2000,
      );

      // Check if there are any matched drivers
      if (matchedDriver && matchedDriver[1]) {
        await this.notifyDriver(matchedDriver[1], orderId);
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

  private async notifyDriver(driver: string, orderId: string) {
    // Logic to notify the matched driver about the order
    console.log(driver, orderId);
  }
}
