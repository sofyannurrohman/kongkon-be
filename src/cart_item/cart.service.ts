import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CartItem } from './cart.entity';
import { CreateCartItemDto } from './dto/create_item_cart.dto';
import { CartService } from 'src/cart/cart.service';
import { CreateCartDto } from 'src/cart/dto/create_cart.dto';

@Injectable()
export class CartItemService {
  constructor(
    @Inject('CART_ITEM_REPOSITORY')
    private readonly cartItemRepository: typeof CartItem,
    private readonly cartService: CartService,
  ) {}

  async addToCartItem(
    customer_id: string,
    createCartItemDto: CreateCartItemDto,
  ) {
    const cartData = new CreateCartDto();
    cartData.customer_id = customer_id;
    cartData.status = 'active';
    cartData.total_amount = 0;
    const cart = await this.cartService.create(cartData);
    // Prepare cart items from the request
    const items = createCartItemDto.items.map((item) => ({
      cart_id: cart.id, // Link each item to the created cart
      item_id: item.item_id,
      item_qty: item.quantity,
      price: item.price,
      note: item.note,
      variant_id: item.variant_id,
    }));

    // Save all cart items in bulk
    const cartItems = await this.cartItemRepository.bulkCreate(items);

    // Optionally, calculate and update the total amount for the cart
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.item_qty,
      0,
    );
    cart.total_amount = totalAmount;
    await cart.save(); // Update the cart's total amount in DB

    return {
      cart,
      cartItems,
    };
  }

  // Get all Carts
  async findAll(): Promise<CartItem[]> {
    return this.cartItemRepository.findAll({
      include: ['items'], // Include related items
    });
  }

  // Get all Carts
  async findByID(id: number): Promise<CartItem> {
    return this.cartItemRepository.findOne({
      where: { id },
      include: ['items', 'merchant'], // Include related items
    });
  }

  async getCartByUserId(userId: string) {
    return this.cartItemRepository.findAll({
      where: { customer_id: userId, order_id: null }, // Only fetch items without an order ID (i.e., not yet checked out)
    });
  }

  // Delete Cart by ID
  async deleteCart(id: number): Promise<void> {
    const cart = await this.findByID(id);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    await cart.destroy();
  }
}
