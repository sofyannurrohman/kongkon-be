import { forwardRef, Module } from '@nestjs/common';
import { CartItemService } from './cart.service';
import { CartItemController } from './cart.controller';
import { cartItemsProviders } from './cart.provider';
import { CartModule } from 'src/cart/cart.module';
import { CartService } from 'src/cart/cart.service';
import { cartsProviders } from 'src/cart/cart.provider';
import { ItemModule } from 'src/item/item.module';
import { ItemService } from 'src/item/item.service';
import { VariantModule } from 'src/variant/variant.module';
import { VariantService } from 'src/variant/variant.service';
import { itemsProviders } from 'src/item/item.provider';
import { DatabaseModule } from 'src/db/database.module';
import { variantsProviders } from 'src/variant/variant.provider';
@Module({
  imports: [
    CartModule,
    ItemModule,
    VariantModule,
    DatabaseModule,
  ],
  providers: [
    CartItemService,
    ...cartItemsProviders,
    CartService,
    ...cartsProviders,
    ItemService,
    ...itemsProviders,
    VariantService,
    ...variantsProviders,
  ],
  controllers: [CartItemController],
  exports: [CartItemService],
})
export class CartItemModule {}
