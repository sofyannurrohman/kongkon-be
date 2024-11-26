import {
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Cart } from 'src/cart/cart.entity';
import { Item } from 'src/item/item.entity';
import { Variant } from 'src/variant/variant.entity';

@Table({
  tableName: 'cartItems',
  timestamps: true,
})
export class CartItem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Item)
  @Column
  item_id: string;
  @Column
  item_qty: number;
  @Column
  note: string;

  @ForeignKey(() => Cart)
  @Column
  cart_id: number;
  @ForeignKey(() => Variant)
  @Column
  variant_id: number;
  @Column
  customer_id: string;

  @BelongsTo(() => Item)
  item: Item;

  @BelongsTo(() => Cart)
  cart: Cart;
  @BelongsTo(() => Variant)
  variant: Variant; // This should match your query and refer to the Variant model
}
