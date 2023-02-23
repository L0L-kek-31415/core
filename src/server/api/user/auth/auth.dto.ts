import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'class-sanitizer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  @Trim()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @Trim()
  readonly email: string;

  @ApiProperty()
  @IsString()
  readonly password: string;
}
