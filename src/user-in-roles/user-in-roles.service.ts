import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserInRoles } from './user-in-role.entity';
import { CreateUserInRoleDto } from './dto/create-user-in-role.dto';

@Injectable()
export class UserInRolesService {
  constructor(
    @Inject('USER_IN_ROLE_REPOSITORY')
    private readonly userInRoleRepository: typeof UserInRoles,
  ) {}

  async create(createUserInRoleDto: CreateUserInRoleDto): Promise<UserInRoles> {
    return this.userInRoleRepository.create(createUserInRoleDto);
  }

  async findAll(): Promise<UserInRoles[]> {
    return this.userInRoleRepository.findAll();
  }

  async findOne(id: number): Promise<UserInRoles> {
    const userInRole = await this.userInRoleRepository.findByPk(id);
    if (!userInRole) {
      throw new NotFoundException(`UserInRole with ID ${id} not found`);
    }
    return userInRole;
  }

  async findByUserIDAndRoleID(
    userID: string,
    roleID: string,
  ): Promise<UserInRoles> {
    const userInRole = await this.userInRoleRepository.findOne({
      where: { user_id: { userID }, role_id: { roleID } },
    });
    if (!userInRole) {
      throw new NotFoundException(`user data not found`);
    }
    return userInRole;
  }

  async update(
    id: number,
    updateUserInRoleDto: CreateUserInRoleDto,
  ): Promise<UserInRoles> {
    const userInRole = await this.findOne(id);
    return userInRole.update(updateUserInRoleDto);
  }

  async remove(id: number): Promise<void> {
    const userInRole = await this.findOne(id);
    await userInRole.destroy();
  }
}
