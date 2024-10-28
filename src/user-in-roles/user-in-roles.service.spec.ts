import { Test, TestingModule } from '@nestjs/testing';
import { UserInRolesService } from './user-in-roles.service';

describe('UserInRolesService', () => {
  let service: UserInRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInRolesService],
    }).compile();

    service = module.get<UserInRolesService>(UserInRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
