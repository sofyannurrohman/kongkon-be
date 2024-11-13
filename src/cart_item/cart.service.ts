import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CartItem } from './cart.entity';
import { CreateCartItemDto } from './dto/create_item_cart.dto';
import { CartService } from 'src/cart/cart.service';
import { CreateCartDto } from 'src/cart/dto/create_cart.dto';
import { ItemService } from 'src/item/item.service';
import { VariantService } from 'src/variant/variant.service';

@Injectable()
export class CartItemService {
  constructor(
    @Inject('CART_ITEM_REPOSITORY')
    private readonly cartItemRepository: typeof CartItem,
    private readonly cartService: CartService,
    private readonly itemService: ItemService,
    private readonly variantService: VariantService,
  ) {}

  async addToCartItem(
    customer_id: string,
    createCartItemDto: CreateCartItemDto,
  ) {
    if (!customer_id) {
      throw new Error('Customer ID is required and cannot be null.');
    }
    const cartData = new CreateCartDto();
    cartData.customer_id = customer_id;
    cartData.status = 'active';
    cartData.total_amount = 0;
    const cart = await this.cartService.create(cartData);

    // Prepare items with server-calculated prices
    const items = await Promise.all(
      createCartItemDto.items.map(async (item) => {
        // Retrieve price based on item_id and optional variant_id from the database
        const itemDetails = await this.itemService.findById(item.item_id);
        if (!itemDetails) {
          throw new Error(`Item with ID ${item.item_id} not found.`);
        }
        console.log(itemDetails);
        let itemPrice = itemDetails.price;

        // If variant_id exists, retrieve variant price and add to base price
        if (item.variant_id) {
          const variantDetails = await this.variantService.findByID(
            item.variant_id,
          );
          itemPrice += variantDetails.additional_price;
        }

        return {
          cart_id: cart.id,
          item_id: item.item_id,
          item_qty: item.quantity,
          price: itemPrice, // server-calculated price
          note: item.note,
          variant_id: item.variant_id,
          customer_id: customer_id,
        };
      }),
    );

    // Save all cart items in bulk
    const cartItems = await this.cartItemRepository.bulkCreate(items);

    // Calculate and update the total amount for the cart
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.item_qty,
      0,
    );
    cart.total_amount = totalAmount;
    await cart.save();

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
//  async update(id:number):
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
