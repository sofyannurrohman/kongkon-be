import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CartItem } from './cart.entity';
import {
  Calculate,
  CreateCartItemDto,
  CreateCartSingleItemDto,
} from './dto/create_item_cart.dto';
import { CartService } from 'src/cart/cart.service';
import { CreateCartDto } from 'src/cart/dto/create_cart.dto';
import { ItemService } from 'src/item/item.service';
import { VariantService } from 'src/variant/variant.service';
import { UpdateCartItemDto } from './dto/update_item_cart.dto';
import { Item } from 'src/item/item.entity';
import { UpdateCartDto } from 'src/cart/dto/update_cart.dto';
import { Cart } from 'src/cart/cart.entity';
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

    const items = await Promise.all(
      createCartItemDto.items.map(async (item) => {
        // Retrieve price based on item_id and optional variant_id from the database
        const itemDetails = await this.itemService.findById(item.item_id);
        if (!itemDetails) {
          throw new Error(`Item with ID ${item.item_id} not found.`);
        }

        // Ensure the item price is a number
        let itemPrice: number = Number(itemDetails.price);
        if (isNaN(itemPrice)) {
          throw new Error(`Invalid price for item ID ${item.item_id}.`);
        }
        console.log(`Base item price for ID ${item.item_id}: ${itemPrice}`);

        // Check if variant ID exists and handle variant price
        if (item.variant_id) {
          const variantDetails = await this.variantService.findByID(
            item.variant_id,
          );
          if (!variantDetails) {
            throw new Error(`Variant with ID ${item.variant_id} not found.`);
          }
          console.log(
            `Variant additional price for ID ${item.variant_id}: ${variantDetails.additional_price}`,
          );

          // Ensure the additional price is a number and add to item price
          const additionalPrice = Number(variantDetails.additional_price);
          if (isNaN(additionalPrice)) {
            throw new Error(
              `Invalid additional price for variant ID ${item.variant_id}.`,
            );
          }
          itemPrice += additionalPrice;
          console.log(`Final item price after adding variant: ${itemPrice}`);
        }

        console.log(
          `Final item price for item ID ${item.item_id}: ${itemPrice}`,
        );

        // Return the item object for the cart
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

  async createSingleCartItem(
    customer_id: string,
    createSingleCartItem: CreateCartSingleItemDto,
  ): Promise<CartItem> {
    const cart = await this.cartItemRepository.create({
      item_id: createSingleCartItem.item_id,
      item_qty: createSingleCartItem.item_qty,
      note: createSingleCartItem.note,
      cart_id: null,
      customer_id,
    });
    return cart;
  }

  async addToCart(customerId: string): Promise<Cart> {
    // Create a new cart
    const cart = await this.cartService.create({
      customer_id: customerId,
      status: 'active',
    });

    // Retrieve the latest cart items and total amount for this customer
    const cartData = await this.getCartItemsByUserId(customerId);

    // Calculate total amount based on retrieved items
    const totalAmount = cartData.cartItems.reduce(
      (sum, item) => sum + item.itemTotal, // Sum up itemTotal of each cart item
      0,
    );

    console.log('Calculated Total Amount:', totalAmount); // Log the total for debugging

    // Update the cart's total amount in the database
    cart.total_amount = totalAmount;

    // Save the cart to reflect the updated total_amount
    await cart.save();

    return cart;
  }

  async findAll(): Promise<CartItem[]> {
    return this.cartItemRepository.findAll({
      include: ['item'], // Include related items
    });
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1Rad) *
        Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in kilometers
  }

  async calculateTotalPrice(Dto: Calculate): Promise<any> {
    let totalPrice = 0;
    const distance = await this.calculateDistance(
      Dto.from_lat,
      Dto.from_lng,
      Dto.to_lat,
      Dto.to_lng,
    );
    // Loop through each item in the request
    for (const item of Dto.items) {
      // Fetch item details from DB using item_id
      const itemDetails = await this.itemService.findById(item.item_id);

      // If the item exists, calculate the price
      if (itemDetails) {
        console.log('Item found:', itemDetails);
        const itemTotal = itemDetails.price * item.quantity;
        totalPrice += itemTotal;
      } else {
        console.error(`Item with ID ${item.item_id} not found`);
      }
    }

    console.log('Total Price Calculated:', totalPrice);
    return { totalPrice, distance }; // Return the calculated total price
  }

  async findByID(id: number): Promise<CartItem> {
    return this.cartItemRepository.findOne({
      where: { id },
      include: ['items', 'merchant'], // Include related items
    });
  }
  async findOne(id: number): Promise<CartItem> {
    return this.cartItemRepository.findOne({
      where: { id },
    });
  }

  async getCartByUserId(userId: string) {
    return this.cartItemRepository.findAll({
      where: { customer_id: userId, cart_id: null }, // Only fetch items without an order ID (i.e., not yet checked out)
    });
  }

  async getCartItemsByUserId(userId: string) {
    // Fetch cart items for the user where cart_id is null
    const cartItems = await this.cartItemRepository.findAll({
      where: { customer_id: userId, cart_id: null },
    });

    // Retrieve item details and calculate total amount
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        // Fetch item details
        const itemDetails = await this.itemService.findById(
          Number(cartItem.item_id),
        );

        if (!itemDetails) {
          throw new Error(`Item with ID ${cartItem.item_id} not found.`);
        }

        // Convert price to number (in case it's a string)
        let itemPrice = itemDetails.price;

        // Validate the item price
        if (isNaN(itemPrice) || itemPrice <= 0) {
          throw new Error(
            `Invalid price for item ID ${cartItem.item_id}: ${itemDetails.price}`,
          );
        }

        // Check if there's a variant and adjust price accordingly
        if (cartItem.variant_id) {
          const variantDetails = await this.variantService.findByID(
            cartItem.variant_id,
          );
          if (variantDetails) {
            let variantPrice = variantDetails.additional_price;

            // Validate the variant price
            if (isNaN(variantPrice) || variantPrice < 0) {
              throw new Error(
                `Invalid additional price for variant ID ${cartItem.variant_id}`,
              );
            }

            itemPrice += variantPrice;
          }
        }

        // Validate item_qty
        const itemQty = cartItem.item_qty;
        if (isNaN(itemQty) || itemQty <= 0) {
          throw new Error(
            `Invalid quantity for item ID ${cartItem.item_id}: ${itemQty}`,
          );
        }

        const itemTotal = itemPrice * itemQty;

        // Log details for debugging
        console.log(
          `Item ID: ${cartItem.item_id}, Price: ${itemPrice}, Quantity: ${itemQty}, Total: ${itemTotal}`,
        );

        // Return each cart item with its details
        return {
          ...cartItem.toJSON(), // Convert cart item to plain object
          itemDetails: {
            name: itemDetails.name,
            price: itemPrice, // calculated price
            description: itemDetails.description,
          },
          itemTotal, // Total for this item
        };
      }),
    );

    // Calculate total amount of all items in the cart
    const totalAmount = itemsWithDetails.reduce(
      (sum, item) => sum + item.itemTotal, // Sum up the itemTotal for each item
      0, // Initial value for the sum is 0
    );

    console.log('Total Amount for Cart:', totalAmount); // Log total amount

    return {
      cartItems: itemsWithDetails,
      totalAmount,
    };
  }

  private async calculateCartTotal(cartId: number): Promise<number> {
    const cartItems = await this.cartItemRepository.findAll({
      where: { cart_id: cartId },
      include: [
        {
          model: Item,
          as: 'item', // This is correct because `CartItem` has @BelongsTo(() => Item)
        },
        {
          model: Cart,
          as: 'cart', // This is correct because `CartItem` has @BelongsTo(() => Cart)
        },
      ],
    });

    console.log(cartItems);
    // Sum the total price of each item in the cart
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      const itemPrice = cartItem.item.price; // Assuming Item has a 'price' field
      totalAmount += itemPrice * cartItem.item_qty;
    }

    return totalAmount;
  }

  async updateCartItem(
    cartItemID: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const { item_id, item_qty, variant_id, note } = updateCartItemDto;
    const cartItem = await this.findOne(cartItemID);
    console.log(cartItem);
    // If CartItem not found, throw an error
    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with id ${cartItemID} not found in cart`,
      );
    }

    // Update the fields on the found CartItem
    cartItem.item_qty = item_qty;
    if (variant_id !== undefined) {
      cartItem.variant_id = variant_id; // Update variant_id if provided
    }
    if (note !== undefined) {
      cartItem.note = note; // Update note if provided
    }

    // Save the updated CartItem
    await cartItem.save();

    // Recalculate the total amount for the cart
    const updatedTotalAmount = await this.calculateCartTotal(cartItem.cart_id);
    const newCartData = new UpdateCartDto();
    newCartData.total_amount = updatedTotalAmount;

    // Update the Cart's total amount
    await this.cartService.update(cartItem.cart_id, newCartData);

    return cartItem;
  }

  // Delete Cart by ID
  async deleteCart(id: number): Promise<void> {
    const cart = await this.findOne(id);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    await cart.destroy();
  }
}
