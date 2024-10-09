import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { MarkTransactionPaidDto } from './dto/transaction_paid.dto';
import { CreateOrderDto } from './dto/create_order.dto';
import { RabbitMQProducerService } from 'src/rabbitmq/rabbitmq_producer.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly rabbitMQProducerService: RabbitMQProducerService,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);

    if (order.status === 'paid') {
      await this.rabbitMQProducerService.publishTransactionPaidEvent({
        orderId: order.id,
        customerId: order.customer_id,
        merchantId: order.merchant_id,
        partnerId: order.partner_id,
        totalAmount: order.total_amount,
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
  //   //   @EventPattern('order.created')
  //   //   async handleOrderCreated(@Payload() data: any) {
  //   //     // Call the matching logic when an order is created
  //   //     await this.driverService.matchDriver(data);
  //   //   }
  // @Post()
  // async createOrder(@Body() createOrderDto: CreateOrderDto) {
  //   return this.orderService.createAndMatchDriver(createOrderDto);
  // }
}
