import { Role } from './roles.entity';
export const rolesProviders = [
  {
    provide: 'ROLE_REPOSITORY',
    useValue: Role,
  },
];
