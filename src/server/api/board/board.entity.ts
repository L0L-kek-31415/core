import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';
import { Ticket } from '../ticket/ticket.entity';
import { User } from '../user/user.entity';

@Entity()
export class Board extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  title!: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  owner!: User;

  @ApiProperty()
  @ManyToOne(() => Project, (project) => project.boards, {
    onDelete: 'CASCADE',
  })
  project!: Project;

  @ApiProperty()
  @OneToMany(() => Ticket, (ticket) => ticket.board, { onDelete: 'CASCADE' })
  tickets: Ticket[];
}
