import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
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
    defaultValue: UUIDV4,
  })
  user_id: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: UUIDV4,
  })
  role_id: string;
}
