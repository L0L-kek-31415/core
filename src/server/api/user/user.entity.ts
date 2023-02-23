import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../board/board.entity';
import { Project } from '../project/project.entity';
import { Ticket } from '../ticket/ticket.entity';

export enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @IsEmail()
  @Column({ type: 'varchar' })
  email!: string;

  @ApiProperty()
  @Exclude()
  @Column({ type: 'varchar' })
  password!: string;

  @ApiProperty()
  @IsOptional()
  @Column({
    type: 'enum',
    enum: RoleEnumType,
    default: RoleEnumType.USER,
  })
  role: RoleEnumType;

  @ApiProperty()
  @OneToMany(() => Board, (board) => board.owner)
  boards: Board[];

  @ApiProperty()
  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @ApiProperty()
  @OneToMany(() => Ticket, (project) => project.owner)
  tickets: Ticket[];

  @ApiProperty()
  @ManyToMany(() => Project, (project) => project.members)
  @JoinTable()
  projects_member: Project[];
}
