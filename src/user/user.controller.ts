import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserResponse } from 'src/model/user.model';
import { WebResponse } from 'src/model/web.model';
import { UsersService } from './user.service';
import { UpdateUserRequest, CreateCustomerDto } from './dto/user.dto';
import { User } from './user.entity';

@Controller('/users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  @HttpCode(200)
  async register(
    @Body() request: CreateCustomerDto,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      status: 'success',
      code: 200,
      message: 'Successfully created new user',
      data: result,
    };
  }
  @Get()
  @HttpCode(200)
  async findAll(): Promise<WebResponse<User[]>> {
    const result = await this.userService.findAll();
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get all user',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebResponse<User>> {
    const result = await this.userService.findOne(id);
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get user by id',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.userService.delete(id);
    if (!deleted) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'User successfully deleted' };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateUserRequest,
  ): Promise<{ message: string; user: User }> {
    const user = await this.userService.update(id, request);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'User updated successfully', user };
  }
}
