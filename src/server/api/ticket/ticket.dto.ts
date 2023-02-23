import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { User } from '../user/user.entity';
import { Board } from '../board/board.entity';

export class CreateTicketDto {
  @ApiProperty()
  @Trim()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsNumber()
  readonly board_id: number;
}

export class ShowTicketDto {
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
  readonly board: Board;

  @ApiProperty()
  readonly created_at: Date;

  @ApiProperty()
  readonly updated_at: Date;

  @ApiProperty()
  readonly board_update: number;
}
