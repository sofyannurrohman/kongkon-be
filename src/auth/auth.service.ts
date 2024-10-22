import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: typeof User,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user_id: string; access_token: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: email },
    });
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      throw new UnauthorizedException();
    }

    const payload = { id: user.id, name: user.name };
    return {
      user_id: user.id,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
