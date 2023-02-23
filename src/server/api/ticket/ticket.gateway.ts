import {
  ClassSerializerInterceptor,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { DecorateAll } from 'decorate-all';
import { Server, Socket } from 'socket.io';
import { BoardService } from '../board/board.service';
import { TicketService } from './ticket.service';

@WebSocketGateway()
@DecorateAll(UseInterceptors(ClassSerializerInterceptor))
export class TicketGateway {
  @Inject(TicketService)
  protected readonly service: TicketService;

  @Inject(BoardService)
  protected readonly boardService: BoardService;

  @WebSocketServer() server: Server;

  @SubscribeMessage('ticketDelete')
  async remove(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { id: number; project_id: number },
  ) {
    const result = await this.service.remove(body.id);
    const res = await this.boardService.getByProject(body.project_id);
    this.server.sockets.emit('boardByProject', { data: res });
    return result;
  }

  @SubscribeMessage('createTicket')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      title: string;
      description: string;
      board_id: number;
      project_id: number;
    },
  ) {
    const user = await this.service.getUser(client.data.id);
    const result = await this.service.create(body, user);
    this.server.sockets.emit('boardByProject', {
      data: await this.boardService.getByProject(body.project_id),
    });
    return result;
  }

  @SubscribeMessage('ticketChangeBoard')
  async getByProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { ticket_id: number; board_id: number },
  ) {
    const result = await this.service.board(body.ticket_id, body.board_id);
    return { data: result };
  }
}
