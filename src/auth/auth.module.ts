import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UsersModule } from '../user/user.module';
import { jwtConstants } from './constant';
import { JwtModule } from '@nestjs/jwt';
import { usersProviders } from 'src/user/user.provider';
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ...usersProviders],
})
export class AuthModule {}
