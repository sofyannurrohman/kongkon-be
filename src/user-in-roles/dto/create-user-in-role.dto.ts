import { IsUUID } from 'class-validator';

export class CreateUserInRoleDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  role_id: string;
}
