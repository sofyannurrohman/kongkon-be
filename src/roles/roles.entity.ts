import { UUIDV4 } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { UserInRoles } from 'src/user-in-roles/user-in-role.entity';

@Table({
  tableName: 'roles', // replace with the table name of your choice
  timestamps: true, // Automatically manages createdAt and updatedAt fields
})
export class Role extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;
  @HasMany(() => UserInRoles)
  userInRoles: UserInRoles[];
}
