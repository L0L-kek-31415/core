import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../board/board.entity';
import { User } from '../user/user.entity';
import { DecorateAll } from 'decorate-all';

@Entity()
@DecorateAll(ApiProperty())
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'SET NULL' })
  owner!: User;

  @ManyToMany(() => User, (user) => user.projects_member, {
    onDelete: 'SET NULL',
  })
  members!: User[];

  @OneToMany(() => Board, (board) => board.project, { onDelete: 'CASCADE' })
  boards!: Board[];
}
