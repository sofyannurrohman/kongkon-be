import { Module } from '@nestjs/common';
import { UserInRolesService } from './user-in-roles.service';
import { UserInRolesController } from './user-in-roles.controller';
import { userInRolesProviders } from './user-in-roles.provider';

@Module({
  controllers: [UserInRolesController],
  providers: [UserInRolesService, ...userInRolesProviders],
  exports: [UserInRolesService],
})
export class UserInRolesModule {}
