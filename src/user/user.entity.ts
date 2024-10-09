import { UUIDV4 } from 'sequelize';
import {
  Table,
  Column,
  Model,
  Default,
  PrimaryKey,
  DataType,
  HasOne,
} from 'sequelize-typescript';
import { Wallet } from 'src/wallet/wallet.entity';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id: string;

  @Column
  name: string;

  @Column
  email: string;

  @Column
  password_hash: string;

  @Column
  phone_number: string;

  @Column
  avatar_file_name: string;

  @Column
  role_id: string;

  @Column
  license_number: string;

  @Column
  is_available: boolean;
  @HasOne(() => Wallet, {
    onDelete: 'CASCADE', // When Merchant is deleted, associated Items will be deleted
    hooks: true, // This ensures Sequelize triggers cascading hooks
  })
  wallet: Wallet[];
}
