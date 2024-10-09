import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { UsersModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { MerchantService } from 'src/merchant/merchant.service';
import { DatabaseModule } from 'src/db/database.module';
import { merchantsProviders } from 'src/merchant/merchant.provider';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    MerchantModule,
    DatabaseModule,
    RabbitmqModule, // Register your model here
  ],
  providers: [PartnerService, MerchantService, ...merchantsProviders],
  controllers: [PartnerController],
  exports: [PartnerService],
})
export class PartnerModule {}
