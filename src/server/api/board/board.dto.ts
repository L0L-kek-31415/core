import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { Project } from '../project/project.entity';
import { User } from '../user/user.entity';
import { Ticket } from '../ticket/ticket.entity';

export class CreateBoardDto {
  @ApiProperty()
  @Trim()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsNumber()
  readonly project_id: number;
}

export class ShowBoardDto {
  @ApiProperty()
  @Trim()
  @IsNumber()
  readonly id: number;

  @ApiProperty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  readonly owner!: User;

  @ApiProperty()
  readonly project!: Project;

  @ApiProperty()
  readonly tickets!: Ticket[];
}
