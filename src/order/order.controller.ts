import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrderService } from './order.service';
import { MarkTransactionPaidDto } from './dto/transaction_paid.dto';
import { CreateOrderDto } from './dto/create_order.dto';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';
import { DistanceDto } from './dto/distance_estimate.dto';
import { WebResponse } from 'src/model/web.model';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly rabbitMQProducerService: RabbitMQProducerService,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);

    if (order.order.status === 'paid') {
      await this.rabbitMQProducerService.publishTransactionPaidEvent({
        orderId: order.order.id,
        customerId: order.order.customer_id,
        merchantId: order.order.merchant_id,
        partnerId: order.order.partner_id,
        totalAmount: order.order.total_amount,
      });
    }

    return order;
  }

  @Post(':orderId/pay')
  async markTransactionAsPaid(
    @Param('orderId') orderId: number,
    @Body() body: MarkTransactionPaidDto,
  ) {
    try {
      const { transactionId } = body;
      await this.orderService.markTransactionAsPaid(orderId, transactionId);
      return { message: 'Order status updated to "paid" and event triggered.' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Unable to update order status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('estimate-price')
  async calculateDistance(
    @Body() distanceDto: DistanceDto,
  ): Promise<WebResponse<number>> {
    const total_cost = await this.orderService.estimateCost(distanceDto);
    return {
      status: 'success',
      code: 200,
      message: 'Success estimate distance price',
      data: total_cost,
    };
  }

  @Post(':id/completed')
  async completeOrder(
    @Param('id') orderId: number,
  ): Promise<{ message: string }> {
    try {
      // Update order status to 'completed'
      const order = await this.orderService.completeOrder(orderId);

      // Publish the order complete event to RabbitMQ
      const completeOrderPayload = { orderId: order.id };
      await this.rabbitMQProducerService.publish(
        'order-events-exchange',
        'order.complete',
        completeOrderPayload,
      );

      console.log('Order complete event published:', completeOrderPayload);

      return { message: `Order ${order.id} is marked as complete` };
    } catch (error) {
      console.error('Error completing order:', error);
      throw new HttpException(
        'Failed to complete the order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') orderId: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const order = await this.orderService.cancelOrder(orderId);
      res.status(HttpStatus.OK).json({
        message: `Order ${orderId} canceled successfully, and the total amount has been refunded to the customer's wallet.`,
        order,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
}
