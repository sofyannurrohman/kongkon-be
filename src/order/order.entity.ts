import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  HasOne,
  AutoIncrement,
} from 'sequelize-typescript';
import { Transaction } from 'src/transaction/transaction.entity';
import { Point } from 'geojson'; // GeoJSON type

@Table({
  tableName: 'orders',
  timestamps: true,
})
export class Order extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id: number;

  @Column
  customer_id: string;

  @Column
  merchant_id: string;

  @Column
  partner_id: string;

  @Column
  status: string;

  @Column({ type: DataType.GEOMETRY('POINT', 4326), allowNull: false })
  from_location: Point;

  @Column({ type: DataType.GEOMETRY('POINT', 4326), allowNull: false })
  to_location: Point;

  @Column
  total_amount: number;

  @Column
  order_type: string;

  @Column
  work_date: string;

  @Column
  merchant_profit: number;

  @Column
  partner_profit: number;

  @Column
  cart_id: number;

  @HasOne(() => Transaction, {
    onDelete: 'CASCADE', // When Merchant is deleted, associated Items will be deleted
    hooks: true, // This ensures Sequelize triggers cascading hooks
  })
  transaction: Transaction;
}
