import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create_item_cart.dto';
import { CartItemService } from './cart.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cart-items')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  // Create Cart
  @UseGuards(AuthGuard)
  @Post()
  async createCart(@Request() req, @Body() createCartDto: CreateCartItemDto) {
    return this.cartItemService.addToCartItem(req.user.id, createCartDto);
  }

  // Get all Carts
  @Get()
  async findAll() {
    return this.cartItemService.findAll();
  }

  // Get Cart by ID
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.cartItemService.findByID(id);
  }

  // Update Cart
  // @Put(':id')
  // async updateCart(
  //   @Param('id') id: number,
  //   @Body() updateCartItemDto: UpdateCartItemDto,
  // ) {
  //   return this.cartItemService.updateCart(id, updateCartItemDto);
  // }

  // Delete Cart
  @Delete(':id')
  async deleteCart(@Param('id') id: number) {
    return this.cartItemService.deleteCart(id);
  }
}
