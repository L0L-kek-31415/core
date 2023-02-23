import { SetMetadata } from '@nestjs/common';
import { RoleEnumType } from '../user.entity';

export const HasRoles = (...roles: RoleEnumType[]) =>
  SetMetadata('roles', roles);
