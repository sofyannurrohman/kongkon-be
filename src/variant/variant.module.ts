import { Module } from '@nestjs/common';

import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';
import { variantsProviders } from './variant.provider';

@Module({
  providers: [VariantService, ...variantsProviders],
  controllers: [VariantController],
  exports: [VariantService],
})
export class VariantModule {}
