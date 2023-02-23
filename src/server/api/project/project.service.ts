import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { Project } from './project.entity';
import { CreateProjectDto, ShowProjectDto } from './project.dto';
import { UserService } from '../user/user.service';
import { BoardService } from '../board/board.service';
import { Board } from '../board/board.entity';
import { ProducerService } from '@/server/kafka/producer.service';

@Injectable()
export class ProjectService {
  @InjectRepository(Project)
  protected readonly repository: Repository<Project>;

  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @Inject(forwardRef(() => ProducerService))
  private readonly producerService: ProducerService;

  @Inject(forwardRef(() => BoardService))
  private readonly boardService: BoardService;

  private readonly projectException = new HttpException(
    'Project does not exist',
    HttpStatus.CONFLICT,
  );

  async getAll(req: Request): Promise<ShowProjectDto[]> {
    const user: User = <User>req.user;
    const projects = await this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndMapMany('prject.memebers', 'project.members', 'mem')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('project.boards', 'boards')
      .where('project.owner.id = :id', { id: user.id })
      .orWhere('mem.id = :id', { id: user.id })
      .getMany();
    return projects;
  }

  async checkPermisstion(id: number, user: User) {
    const project: Project = await this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndMapMany('prject.memebers', 'project.members', 'mem')
      .leftJoinAndSelect('project.members', 'members')
      .where('project.id = :id', { id: id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('project.owner.id = :id', { id: user.id }).orWhere(
            'mem.id = :id',
            { id: user.id },
          );
        }),
      )
      .getOne();
    if (!project) {
      return new HttpException(
        'you does not have permission to this board/project',
        HttpStatus.CONFLICT,
      );
    }
  }

  async create(body: CreateProjectDto, req: Request): Promise<ShowProjectDto> {
    const { title, description }: CreateProjectDto = body;
    const user: User = <User>req.user;
    const project = new Project();
    project.description = description;
    project.owner = user;
    project.title = title;
    await this.producerService.produceUser({
      id: user.id,
      add: true,
      method: 'projects',
    });
    const new_project = await this.repository.save(project);
    await this.producerService.produceProject({
      id: new_project.id,
      name: title,
      method: 'create',
    });
    return new_project;
  }

  async update(
    req: Request,
    body: { title?: string; description?: string },
    id: number,
  ): Promise<ShowProjectDto> {
    const project: Project = await this.getById(id);
    const { title, description } = body;
    if (description) {
      project.description = description;
    }
    if (title) {
      project.title = title;
    }
    return await this.repository.save(project);
  }

  async delete(id: number, req: Request): Promise<string> {
    const user: User = <User>req.user;
    const project: Project = await this.getById(id);
    await this.repository.delete(id);
    await this.producerService.produceUser({
      id: user.id,
      add: false,
      method: 'projects',
    });
    await this.producerService.produceProject({
      id: id,
      method: 'delete',
    });
    throw new HttpException('Completed', HttpStatus.OK);
  }

  async member(
    id: number,
    body: { member_id: number },
    req: Request,
  ): Promise<ShowProjectDto> {
    const user: User = await this.userService.getById(body.member_id);
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.CONFLICT);
    }
    const project = await this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'members')
      .where('project.id = :id', { id: id })
      .getOne();
    if (!project) {
      throw this.projectException;
    }
    let counter = 0;
    let memberIndex = -1;
    project.members.map((member: User) => {
      if (member.id == user.id) {
        memberIndex = counter;
      }
      counter++;
    });
    if (memberIndex > -1) {
      project.members.splice(memberIndex, 1);
      await this.producerService.produceProject({
        id: id,
        add: false,
        method: 'members',
      });
    } else {
      project.members.push(user);
      await this.producerService.produceProject({
        id: id,
        add: true,
        method: 'members',
      });
    }

    return this.repository.save(project);
  }

  async board(
    board_id: number,
    project_id: number,
    req: Request,
  ): Promise<ShowProjectDto> {
    const board_old: Board = await this.boardService.getWith(
      board_id,
      'project',
    );
    if (!board_old) {
      throw new HttpException('Board does not exist', HttpStatus.CONFLICT);
    }
    const project = await this.repository
      .createQueryBuilder()
      .leftJoinAndSelect('project.boards', 'boards')
      .where('project.id = :id', { id: project_id })
      .getOne();
    if (!project) {
      throw this.projectException;
    }
    let counter = 0;
    let boardIndex = -1;
    if (project.boards.length > 0) {
      project.boards.map((board: Board) => {
        if (board.id == board_old.id) {
          boardIndex = counter;
        }
        counter++;
      });
    }
    if (boardIndex > -1) {
      project.boards.splice(boardIndex, 1);
      await this.producerService.produceProject({
        id: project.id,
        add: false,
        method: 'boards',
      });
    } else {
      project.boards.push(board_old);
      await this.producerService.produceProject({
        id: project.id,
        add: true,
        method: 'boards',
      });
    }
    return this.repository.save(project);
  }

  async getById(id: number): Promise<Project> {
    const project: Project = await this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('project.boards', 'boards')
      .where('project.id = :id', { id: id })
      .getOne();
    if (!project) {
      throw this.projectException;
    }
    return project;
  }

  async getByIdWithOwner(id: number): Promise<Project> {
    const project: Project = await this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.onwer', 'owner')
      .where('project.id = :id', { id: id })
      .getOne();
    if (!project) {
      throw this.projectException;
    }
    return project;
  }

  async simpleGetById(id: number): Promise<Project> {
    const project: Project = await this.repository.findOne({
      where: { id: id },
    });
    if (!project) {
      throw this.projectException;
    }
    return project;
  }
}
