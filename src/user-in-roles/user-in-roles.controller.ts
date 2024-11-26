import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UserInRolesService } from './user-in-roles.service';
import { CreateUserInRoleDto } from './dto/create-user-in-role.dto';

@Controller('user-in-roles')
export class UserInRolesController {
  constructor(private readonly userInRoleService: UserInRolesService) {}

  @Post()
  async create(@Body() createUserInRoleDto: CreateUserInRoleDto) {
    return this.userInRoleService.create(createUserInRoleDto);
  }

  @Get()
  async findAll() {
    return this.userInRoleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userInRoleService.findOne(id);
  }

  @Get('users/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.userInRoleService.isAdmin(userId);
  }
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserInRoleDto: CreateUserInRoleDto,
  ) {
    return this.userInRoleService.update(id, updateUserInRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.userInRoleService.remove(id);
  }
}
