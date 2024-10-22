import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { cartsProviders } from './cart.provider';

@Module({
  controllers: [CartController],
  providers: [CartService, ...cartsProviders],
  exports: [CartService],
})
export class CartModule {}
