import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Cart } from './cart.entity';
import { CreateCartDto } from './dto/create_cart.dto';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update_cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto): Promise<Cart> {
    return this.cartService.create(createCartDto);
  }

  @Get()
  findAll(): Promise<Cart[]> {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Cart> {
    return this.cartService.findByID(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    return this.cartService.update(id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<boolean> {
    return this.cartService.delete(id);
  }
}
