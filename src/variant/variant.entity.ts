import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Item } from 'src/item/item.entity';

@Table({
  tableName: 'variants',
  timestamps: true,
})
export class Variant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Item)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  item_id: string;

  @Column
  name: string;
  @Column
  type: string;
  @Column
  additional_price: number;

  @BelongsTo(() => Item, {
    onDelete: 'CASCADE', // When Item is deleted, this relationship will be deleted
  })
  item: Item;
}
