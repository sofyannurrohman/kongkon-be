import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { itemsProviders } from './item.provider';
import { VariantService } from 'src/variant/variant.service';
import { DatabaseModule } from 'src/db/database.module';
import { variantsProviders } from 'src/variant/variant.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ItemController],
  providers: [
    ItemService,
    ...itemsProviders,
    VariantService,
    ...variantsProviders,
  ],
})
export class ItemModule {}
