import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ordersProviders } from './order.provider';
import { MerchantModule } from 'src/merchant/merchant.module';
import { PartnerModule } from 'src/partner/partner.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [MerchantModule, PartnerModule, RabbitmqModule],
  controllers: [OrderController],
  providers: [OrderService, ...ordersProviders], // Make sure to include OrderService here
})
export class OrderModule {}
