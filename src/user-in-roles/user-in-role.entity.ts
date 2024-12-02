import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../user/user.entity'; // Assuming you have a User entity
import { Role } from '../roles/roles.entity'; // Assuming you have a Role entity
import { UUIDV4 } from 'sequelize';

@Table({
  timestamps: true,
  tableName: 'userinroles',
})
export class UserInRoles extends Model<UserInRoles> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  role_id: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Role)
  role: Role;
}
