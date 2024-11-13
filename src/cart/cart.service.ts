import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cart } from './cart.entity';
import { CreateCartDto } from './dto/create_cart.dto';
import { UpdateCartDto } from './dto/update_cart.dto';
import { CartItem } from 'src/cart_item/cart.entity';
import { Merchant } from 'src/merchant/merchant.entity';
import { Item } from 'src/item/item.entity';
import { where } from 'sequelize';
import { Variant } from 'src/variant/variant.entity';

@Injectable()
export class CartService {
  constructor(
    @Inject('CART_REPOSITORY')
    private cartRepository: typeof Cart,
  ) {}

  async create(cartData: CreateCartDto): Promise<Cart> {
    const cart = await this.cartRepository.create({
      customer_id: cartData.customer_id, // Ensure this is passed
      status: cartData.status, // Ensure this is passed
      total_amount: cartData.total_amount, // Ensure this is passed
    });
    return cart;
  }
  async findAll(): Promise<Cart[]> {
    return await this.cartRepository.findAll({
      include: [
        {
          model: CartItem,
          as: 'items', // Assuming the alias is 'items'
          include: [
            {
              model: Item,
              as: 'item', // Assuming the alias is 'item'
              include: [
                {
                  model: Merchant,
                  as: 'merchant', // Assuming the alias is 'merchant'
                },
              ],
            },
          ],
        },
      ],
    });
  }
  async findByID(id: number): Promise<Cart> {
    return await this.cartRepository.findOne({
      where: { id },
      include: [
        {
          model: CartItem,
          attributes: ['id', 'item_id', 'item_qty', 'variant'],
          include: [
            {
              model: Item,
              attributes: ['id', 'name', 'price'],
              include: [
                {
                  model: Merchant,
                  attributes: ['id', 'location', 'name'],
                },
                
              ], // Eager load merchant within item
            },
          ],
        },
      ],
    });
  }
  async delete(id: number): Promise<boolean> {
    const result = await this.cartRepository.destroy({ where: { id } });
    return result > 0;
  }
  async update(id: number, request: UpdateCartDto): Promise<Cart> {
    const user = await this.cartRepository.findByPk(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await user.update(request);
    return user;
  }
}
