import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from '../board/board.entity';
import { User } from '../user/user.entity';

@Entity()
export class Ticket extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.tickets)
  owner!: User;

  @ApiProperty()
  @Column({ type: 'varchar' })
  title!: string;

  @ApiProperty()
  @Column({ type: 'varchar' })
  description!: string;

  @ApiProperty()
  @ManyToOne(() => Board, (board) => board.tickets, { onDelete: 'SET NULL' })
  board: Board;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty()
  @Column({ type: 'bigint' })
  board_update: number;
}
