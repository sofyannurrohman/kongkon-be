import {
  AutoIncrement,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CartItem } from 'src/cart_item/cart.entity';
import { User } from 'src/user/user.entity';
@Table({
  tableName: 'carts',
  timestamps: true,
})
export class Cart extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  customer_id: string;

  @Column
  status: string;

  @Column
  total_amount: number;

  @HasMany(() => CartItem)
  items: CartItem[];
}
