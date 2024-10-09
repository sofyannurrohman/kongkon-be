import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { merchantsProviders } from './merchant.provider';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService, ...merchantsProviders],
  exports: [MerchantService],
})
export class MerchantModule {}
