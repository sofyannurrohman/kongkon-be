import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  ForeignKey,
} from 'sequelize-typescript';
import { Order } from 'src/order/order.entity';
import { User } from 'src/user/user.entity';
@Table({
  tableName: 'transactions',
  timestamps: true,
})
export class Transaction extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id: number;

  @Column
  @ForeignKey(() => Order)
  order_id: string;

  @Column
  @ForeignKey(() => User)
  user_id: string;

  @Column
  status: string;

  @Column
  amount: number;

  @Column
  code: string;
}
