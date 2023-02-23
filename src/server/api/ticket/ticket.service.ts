import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { Ticket } from './ticket.entity';
import { ShowTicketDto } from './ticket.dto';
import { Board } from '../board/board.entity';
import { BoardService } from '../board/board.service';
import { UserService } from '../user/user.service';
import { ProducerService } from '@/server/kafka/producer.service';

@Injectable()
export class TicketService {
  @InjectRepository(Ticket)
  protected readonly repository: Repository<Ticket>;

  @Inject(forwardRef(() => BoardService))
  private readonly boardService: BoardService;

  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @Inject(forwardRef(() => ProducerService))
  private readonly producerService: ProducerService;

  async simpleGetById(id: number): Promise<Ticket> {
    const ticket: Ticket = await this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.board', 'board')
      .leftJoinAndSelect('ticket.owner', 'owner')
      .where('ticket.id = :id', { id: id })
      .getOne();
    if (!ticket) {
      throw new HttpException('Ticket does not exist', HttpStatus.CONFLICT);
    }
    return ticket;
  }

  async getUser(id: number) {
    return this.userService.getById(id);
  }

  async getById(id: number): Promise<ShowTicketDto> {
    return this.simpleGetById(id);
  }

  async getAll(): Promise<Ticket[]> {
    return await this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.owner', 'owner')
      .leftJoinAndSelect('ticket.board', 'board')
      .limit(15)
      .getMany();
  }

  async create(body: any, user: User): Promise<any> {
    const { title, description, board_id } = body;
    const board: Board = await this.boardService.getWith(board_id, 'project');
    const error = await this.boardService.checkPermissions(board.id, user);
    if (error) {
      throw error;
    }
    const ticket = new Ticket();
    ticket.board = board;
    ticket.description = description;
    ticket.owner = user;
    ticket.title = title;
    await this.producerService.produceUser({
      method: 'tickets',
      id: user.id,
      add: true,
    });
    await this.producerService.produceProject({
      method: 'tickets',
      id: board.project.id,
      add: true,
    });
    ticket.board_update = new Date().getTime();
    const existing_ticket: Ticket = await this.repository.save(ticket);
    return existing_ticket;
  }

  async update(
    req: Request,
    body: { title?: string; description?: string },
    id: number,
  ): Promise<ShowTicketDto> {
    const ticket: Ticket = await this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.owner', 'owner')
      .where('ticket.id = :id', { id: id })
      .getOne();
    await this.userService.isOwner(req, ticket.owner.id);
    if (body.title) {
      ticket.title = body.title;
    }
    if (body.description) {
      ticket.description = body.description;
    }
    return this.repository.save(ticket);
  }

  async delete(id: number, req: Request): Promise<string> {
    const ticket: Ticket = await this.repository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.board', 'board')
      .leftJoinAndSelect('ticket.owner', 'owner')
      .where('ticket.id = :id', { id: id })
      .getOne();
    this.userService.isOwner(req, ticket.owner.id);
    const delTime = new Date();
    const board = await this.boardService.getWith(ticket.board.id, 'project');
    await this.producerService.produceUser({
      method: 'tickets',
      id: ticket.owner.id,
      add: false,
    });
    await this.producerService.produceProject({
      method: 'tickets',
      id: board.project.id,
      time: Math.abs((delTime.getTime() - ticket.board_update) / 1000),
    });
    this.repository.delete(id);
    return 'Complete';
  }
  async remove(id: number): Promise<string> {
    this.repository.delete(id);
    return 'Complete';
  }

  async board(id: number, board_id: number): Promise<ShowTicketDto> {
    const ticket: Ticket = await this.simpleGetById(id);
    if (board_id == ticket.board.id) {
      throw new HttpException(
        'The ticket is already in this board',
        HttpStatus.CONFLICT,
      );
    }
    const new_board: Board = await this.boardService.getWith(
      board_id,
      'project',
    );
    await this.boardService.ticket(ticket.id, ticket.board.id);
    ticket.board = new_board;
    ticket.board_update = new Date().getTime();
    await this.boardService.ticket(ticket.id, new_board.id);
    ticket.updated_at = new Date();
    return this.repository.save(ticket);
  }
}
