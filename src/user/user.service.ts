import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { User } from './user.entity';
import { UpdateUserRequest, CreateCustomerDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { WalletService } from 'src/wallet/wallet.service';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: typeof User,

    private walletService: WalletService,
  ) {}
  async register(userData: CreateCustomerDto): Promise<User> {
    const hashed_password = await bcrypt.hash(userData.password, 10);
    const is_not_available = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (is_not_available) {
      throw new HttpException(
        'Email has been registered',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userRepository.create({
      name: userData.name,
      email: userData.email,
      password_hash: hashed_password,
      phone_number: userData.phone_number,
      avatar_file_name: '',
      role_id: 'customer',
      license_number: '',
      is_available: false,
    });
    this.walletService.create(user.id);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.destroy({ where: { id } });
    return result > 0;
  }

  async update(id: string, request: UpdateUserRequest): Promise<User> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await user.update(request); // Update the user with new data
    return user;
  }
  async uploadAvatar(userId: number, file: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const avatarFileName = `${uuidv4()}-${file.originalname}`;
    const filePath = join(__dirname, '../../uploads/avatars', avatarFileName);

    try {
      // Save the file to the filesystem
      await writeFile(filePath, file.buffer);

      // Update the user with the avatar filename
      user.avatar_file_name = avatarFileName;
      await user.save();

      return user;
    } catch (error) {
      throw new BadRequestException('Error uploading avatar');
    }
  }
}
