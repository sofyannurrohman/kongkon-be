import {
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Merchant } from 'src/merchant/merchant.entity';
import { Variant } from 'src/variant/variant.entity';

@Table({
  tableName: 'items',
  timestamps: true,
})
export class Item extends Model<Item> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @ForeignKey(() => Merchant)
  @Column
  merchant_id: string;

  @Column
  rating: number;

  @Column
  description: string;

  @Column
  filename: string;

  @Column
  price: number;

  @Column
  type: string;

  @Column
  customize: boolean;

  @Column
  is_available: boolean;

  @BelongsTo(() => Merchant, {
    onDelete: 'CASCADE', // When Merchant is deleted, this relationship will be deleted
  })
  merchant: Merchant;

  @HasMany(() => Variant, {
    onDelete: 'CASCADE', // When Item is deleted, associated Variants will be deleted
    hooks: true,
  })
  variants: Variant[];
}