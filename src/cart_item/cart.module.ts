import { Module } from '@nestjs/common';
import { CartItemService } from './cart.service';
import { CartItemController } from './cart.controller';
import { cartItemsProviders } from './cart.provider';
import { CartModule } from 'src/cart/cart.module';
import { CartService } from 'src/cart/cart.service';
import { cartsProviders } from 'src/cart/cart.provider';

@Module({
  imports: [CartModule],
  providers: [
    CartItemService,
    ...cartItemsProviders,
    CartService,
    ...cartsProviders,
  ],
  controllers: [CartItemController],
})
export class CartItemModule {}
