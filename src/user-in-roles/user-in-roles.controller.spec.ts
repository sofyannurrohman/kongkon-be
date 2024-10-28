import { Test, TestingModule } from '@nestjs/testing';
import { UserInRolesController } from './user-in-roles.controller';
import { UserInRolesService } from './user-in-roles.service';

describe('UserInRolesController', () => {
  let controller: UserInRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInRolesController],
      providers: [UserInRolesService],
    }).compile();

    controller = module.get<UserInRolesController>(UserInRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
