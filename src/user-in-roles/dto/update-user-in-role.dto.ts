import { PartialType } from '@nestjs/mapped-types';
import { CreateUserInRoleDto } from './create-user-in-role.dto';

export class UpdateUserInRoleDto extends PartialType(CreateUserInRoleDto) {}
