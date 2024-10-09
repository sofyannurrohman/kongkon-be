import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { usersProviders } from './user.provider';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [WalletModule],
  providers: [UsersService, ...usersProviders],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
