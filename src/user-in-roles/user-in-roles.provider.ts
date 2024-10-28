import { UserInRoles } from './user-in-role.entity';

export const userInRolesProviders = [
  {
    provide: 'USER_IN_ROLE_REPOSITORY',
    useValue: UserInRoles,
  },
];
