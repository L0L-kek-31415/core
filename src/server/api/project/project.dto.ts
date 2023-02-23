import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { User } from '../user/user.entity';
import { Board } from '../board/board.entity';

export class CreateProjectDto {
  @ApiProperty()
  @Trim()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsString()
  readonly description: string;
}

export class ShowProjectDto {
  @ApiProperty()
  @Trim()
  @IsNumber()
  readonly id: number;

  @ApiProperty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  readonly owner: User;

  @ApiProperty()
  readonly boards: Board[];

  @ApiProperty()
  readonly members: User[];
}
