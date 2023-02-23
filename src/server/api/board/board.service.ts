import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { CreateBoardDto, ShowBoardDto } from './board.dto';
import { User } from '../user/user.entity';
import { ProjectService } from '../project/project.service';
import { Project } from '../project/project.entity';
import { Ticket } from '../ticket/ticket.entity';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { ProducerService } from '@/server/kafka/producer.service';

@Injectable()
export class BoardService {
  @InjectRepository(Board)
  protected readonly repository: Repository<Board>;
  @Inject(forwardRef(() => ProjectService))
  private readonly projectService: ProjectService;
  @Inject(forwardRef(() => TicketService))
  private readonly ticketService: TicketService;
  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;
  @Inject(forwardRef(() => ProducerService))
  private readonly producerService: ProducerService;

  async update(body: { title: string }, id: number): Promise<ShowBoardDto> {
    const board: Board = await this.repository.findOne({ where: { id: id } });
    if (!board) {
      throw new HttpException('Board does not exist', HttpStatus.CONFLICT);
    }
    board.title = body.title;
    return this.repository.save(board);
  }

  async getUser(id: number) {
    return this.userService.getById(id);
  }

  async delete(id: number) {
    const board: Board = await this.repository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.owner', 'owner')
      .leftJoinAndSelect('board.project', 'project')
      .where('board.id = :id', { id: id })
      .getOne();
    if (!board) {
      throw new HttpException('Board does not exist', HttpStatus.CONFLICT);
    }
    await this.producerService.produceUser({
      id: board.owner.id,
      method: 'boards',
      add: false,
    });
    await this.producerService.produceProject({
      id: board.project.id,
      method: 'boards',
      add: false,
    });
    this.repository.delete(id);
    return 'ok';
  }

  async create(body: CreateBoardDto, user: User): Promise<ShowBoardDto> {
    const { title, project_id }: CreateBoardDto = body;
    const project: Project = await this.projectService.simpleGetById(
      project_id,
    );
    const board = new Board();
    board.owner = user;
    board.project = project;
    board.title = title;
    const existing_board: Board = await this.repository.save(board);
    await this.producerService.produceUser({
      id: user.id,
      method: 'boards',
      add: true,
    });
    await this.producerService.produceProject({
      id: project.id,
      method: 'boards',
      add: true,
    });
    return existing_board;
  }

  async getAll(): Promise<ShowBoardDto[]> {
    return await this.repository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.owner', 'owner')
      .leftJoinAndSelect('board.tickets', 'tickets')
      .leftJoinAndSelect('board.project', 'project')
      .limit(15)
      .getMany();
  }

  async getById(id: number): Promise<ShowBoardDto> {
    return await this.repository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.owner', 'owner')
      .leftJoinAndSelect('board.tickets', 'tickets')
      .leftJoinAndSelect('board.project', 'project')
      .where('board.id = :id', { id: id })
      .getOne();
  }

  async simpleGetById(id: number): Promise<Board> {
    const board: Board = await this.repository.findOne({ where: { id: id } });
    if (!board) {
      throw new HttpException('Board does not exist', HttpStatus.CONFLICT);
    }
    return board;
  }

  async tickteChange(ticket_id: number, board_id: number) {
    return await this.ticketService.board(ticket_id, board_id);
  }

  async ticket(ticket_id: number, board_id: number): Promise<ShowBoardDto> {
    const ticket: Ticket = await this.ticketService.simpleGetById(ticket_id);
    const board: Board = await this.repository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.tickets', 'tickets')
      .leftJoinAndSelect('board.project', 'project')
      .where('board.id = :id', { id: board_id })
      .getOne();
    if (!board) {
      throw new HttpException('Board does not exist', HttpStatus.CONFLICT);
    }
    let counter = 0;
    let ticketIndex = -1;
    let upTime: number = null;
    board.tickets.map((ticket_old: Ticket) => {
      if (ticket_old.id == ticket.id) {
        ticketIndex = counter;
        upTime = ticket.board_update;
      }
      counter++;
    });
    if (ticketIndex > -1) {
      board.tickets.splice(ticketIndex, 1);
      const delTime = new Date();
      this.producerService.produceProject({
        id: board.project.id,
        method: 'tickets',
        add: false,
        time: Math.abs((delTime.getTime() - upTime) / 1000),
      });
    } else {
      board.tickets.push(ticket);
      this.producerService.produceProject({
        id: board.project.id,
        method: 'tickets',
        add: true,
      });
    }
    return this.repository.save(board);
  }

  async checkPermissions(id: number, user: User) {
    if (user.role != 'admin') {
      const board: Board = await this.getWith(id, 'project');
      return this.projectService.checkPermisstion(board.project.id, user);
    }
  }

  async getByProject(id: number) {
    if (typeof id != 'number') {
      throw new HttpException('yeban', HttpStatus.CONFLICT);
    }
    const first = await this.repository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.tickets', 'tickets')
      .where('board.project = :id', { id: id })
      .getMany();
    return first;
  }

  async getWith(id: number, withWhat: string): Promise<any> {
    let board: Board;
    try {
      board = await this.repository
        .createQueryBuilder('board')
        .leftJoinAndSelect('board.' + withWhat, withWhat)
        .where('board.id = :id', { id: id })
        .getOne();
    } catch (error) {
      Logger.debug('error in board (permissions)');
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
    if (!board) {
      throw new HttpException('Board does not exist', HttpStatus.CONFLICT);
    }
    return board;
  }
}
