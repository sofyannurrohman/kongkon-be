import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { usersProviders } from './user.provider';
import { WalletModule } from 'src/wallet/wallet.module';
import { UserInRolesModule } from 'src/user-in-roles/user-in-roles.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    WalletModule,
    forwardRef(() => UserInRolesModule),
    forwardRef(() => RolesModule),
  ],
  providers: [UsersService, ...usersProviders],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
