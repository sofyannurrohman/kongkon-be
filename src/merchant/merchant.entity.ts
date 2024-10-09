import { v4 as UUIDV4 } from 'uuid';
import {
  Table,
  Column,
  Model,
  Default,
  PrimaryKey,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Item } from 'src/item/item.entity';

@Table({
  tableName: 'merchants',
  timestamps: true,
})
export class Merchant extends Model<Merchant> {
  @PrimaryKey
  @Default(UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column
  name: string;

  @Column
  rating: number;

  @Column
  description: string;

  @Column
  filename: string;

  @Column
  user_id: string;

  @Column({ type: DataType.GEOMETRY('POINT', 4326), allowNull: false })
  location: object;

  @Column
  is_available: boolean;

  @HasMany(() => Item, {
    onDelete: 'CASCADE', // When Merchant is deleted, associated Items will be deleted
    hooks: true, // This ensures Sequelize triggers cascading hooks
  })
  items: Item[];
}
