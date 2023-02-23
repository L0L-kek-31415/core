import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RoleEnumType } from './user.entity';

export class UpdateNameDto {
  @ApiProperty()
  @IsString()
  readonly role: RoleEnumType;
}
