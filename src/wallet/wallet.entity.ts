import { UUIDV4 } from 'sequelize';
import {
  Table,
  Column,
  Model,
  Default,
  PrimaryKey,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';

@Table({
  tableName: 'wallets',
  timestamps: true,
})
export class Wallet extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ForeignKey(() => User)
  user_id: string;

  @Column({
    type: DataType.INTEGER,
  })
  saldo: number;
  @BelongsTo(() => User, {
    onDelete: 'CASCADE', // When Merchant is deleted, this relationship will be deleted
  })
  user: User;
}
