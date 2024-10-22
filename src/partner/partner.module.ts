import { forwardRef, Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { UsersModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { MerchantService } from 'src/merchant/merchant.service';
import { DatabaseModule } from 'src/db/database.module';
import { merchantsProviders } from 'src/merchant/merchant.provider';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderModule } from 'src/order/order.module';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    MerchantModule,
    DatabaseModule,
    RabbitmqModule, // Register your model here
    NotificationModule,
    forwardRef(() => OrderModule),
  ],
  providers: [
    PartnerService,
    MerchantService,
    ...merchantsProviders,
    NotificationService,
  ],
  controllers: [PartnerController],
  exports: [PartnerService],
})
export class PartnerModule {}
