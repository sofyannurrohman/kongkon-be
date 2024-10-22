import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PartnerService } from './partner.service';
import {
  FindNearbyDriversDto,
  NearbyDriverResponseDto,
} from './dto/find-nearby-drivers.dto';
import { NotificationService } from 'src/notification/notification.service';
import { OrderService } from 'src/order/order.service';
import { DriverStatusDto } from './dto/driver_status.dto';

@Controller('partner')
export class PartnerController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly orderService: OrderService,
    private readonly partnerService: PartnerService,
  ) {}
  // Endpoint for posting the driver's location
  @Post('location/:driverId')
  async postLocation(
    @Param('driverId') driverId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ) {
    // Calls the DriverService's postLocation method
    return await this.partnerService.postLocation(
      driverId,
      latitude,
      longitude,
    );
  }

  // Endpoint for retrieving the driver's location
  @Get('location/:driverId')
  async getLocation(@Param('driverId') driverId: string) {
    // Calls the partnerService's getLocation method
    return await this.partnerService.getLocation(driverId);
  }
  @Get('location')
  async getAllFromRedis(): Promise<
    { driverId: string; latitude: number; longitude: number }[]
  > {
    // Calls the partnerService's getLocation method
    return await this.partnerService.getAllDriversFromRedis();
  }
  @Post('nearby')
  async getNearbyDrivers(
    @Body() findNearbyDriversDto: FindNearbyDriversDto,
  ): Promise<NearbyDriverResponseDto[]> {
    const driverIds = await this.partnerService.findNearbyDrivers(
      findNearbyDriversDto.merchantId,
      findNearbyDriversDto.radiusInMeters,
    );
    return driverIds.map((id) => ({ id })); // Map to DTO
  }

  @Post(':id/rematch')
  async rematchDriver(@Param('id') orderId: number) {
    return this.partnerService.handleRematch(orderId);
  }

  @Post('update-status')
  async updateDriverStatus(@Body() driverStatusDto: DriverStatusDto) {
    // Update order status
    const order = await this.orderService.findOrderById(
      driverStatusDto.orderId,
    );
    if (!order) {
      return { message: 'Order not found' };
    }

    // Update order's status in the database (optional)
    order.status = driverStatusDto.status;
    await order.save();

    // Notify customer and merchant about the driver’s status
    await this.notificationService.sendDriverStatusUpdate(
      order.customer_id,
      order.merchant_id,
      driverStatusDto,
    );

    return { message: 'Driver status updated successfully' };
  }

  // @Post('/accept-order')
  // async acceptOrder(@Body() acceptOrderDto: AcceptOrderDto) {
  //   const { driverId, orderId } = acceptOrderDto;
  //   await this.orderService.assignDriverToOrder(driverId, orderId);
  //   // Notify the customer that the driver is on the way
  //   await this.notificationService.notifyCustomer(orderId, driverId);
  // }
}
