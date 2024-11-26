import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  Calculate,
  CreateCartItemDto,
  CreateCartSingleItemDto,
} from './dto/create_item_cart.dto';
import { CartItemService } from './cart.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateCartItemDto } from './dto/update_item_cart.dto';
import { WebResponse } from 'src/model/web.model';
import { CartItem } from './cart.entity';
import { Cart } from 'src/cart/cart.entity';

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

  // Update Cart Item
  @Put(':cartId')
  async updateCartItem(
    @Param('cartId') cartId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<WebResponse<CartItem>> {
    const result = await this.cartItemService.updateCartItem(
      cartId,
      updateCartItemDto,
    );
    return {
      code: 200,
      status: 'success',
      message: 'Success update car item',
      data: result,
    };
  }
  // Delete Cart
  @Delete(':id')
  async deleteCart(@Param('id') id: number) {
    return this.cartItemService.deleteCart(id);
  }

  // Add items to the cart
  @Post('users/:customerId')
  async addToCart(@Param('customerId') id: string): Promise<Cart> {
    try {
      const cart = await this.cartItemService.addToCart(id);

      // Optionally, you could return the updated cart with the items added
      return cart;
    } catch (error) {
      // Handle the error gracefully (optional)
      throw new HttpException(
        'Error while adding to cart: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('calculate')
  async calculateTotal(@Body() Dto: Calculate) {
    const estimate = await this.cartItemService.calculateTotalPrice(Dto);
    return { estimate }; // Return the total price to the client, without saving
  }

  // @Get(':userId/estimate-price')
  // @HttpCode(200)
  // async getCartItemsByUserId(
  //   @Param('userId') userId: string,
  // ): Promise<WebResponse<any>> {
  //   try {
  //     const result = await this.cartItemService.getCartItemsByUserId(userId);

  //     return {
  //       status: 'success',
  //       code: HttpStatus.OK,
  //       message: 'Cart items retrieved successfully',
  //       data: result,
  //     };
  //   } catch (error) {
  //     // Handle any errors (optional)
  //     return {
  //       status: 'error',
  //       code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error.message,
  //       data: null,
  //     };
  //   }
  // }
}
