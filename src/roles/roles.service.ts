import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @Inject('ROLE_REPOSITORY')
    private roleRepository: typeof Role,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const result = await this.roleRepository.create({ ...createRoleDto });
    return result;
  }

  async findAll(): Promise<Role[]> {
    const result = await this.roleRepository.findAll();
    return result;
  }

  async findOne(id: string): Promise<Role> {
    const result = await this.roleRepository.findOne({ where: { id } });
    return result;
  }

  async findByName(name: string): Promise<Role> {
    const result = await this.roleRepository.findOne({ where: { name } });
    return result;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleRepository.destroy({ where: { id } });
    return result > 0;
  }
}
