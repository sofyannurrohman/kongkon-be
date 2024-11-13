import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UsersModule } from '../user/user.module';
import { jwtConstants } from './constant';
import { JwtModule } from '@nestjs/jwt';
import { usersProviders } from 'src/user/user.provider';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    NotificationModule,
    CacheModule.register({
      ttl: 300, // default TTL (e.g., 5 minutes)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ...usersProviders, NotificationGateway],
})
export class AuthModule {}
