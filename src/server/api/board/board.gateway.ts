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
import { User } from '../user/user.entity';
import { BoardService } from './board.service';

@WebSocketGateway()
@DecorateAll(UseInterceptors(ClassSerializerInterceptor))
export class BoardGateway {
  @Inject(BoardService)
  protected readonly service: BoardService;

  @WebSocketServer() server: Server;

  @SubscribeMessage('createBoard')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { title: string; project_id: number },
  ) {
    const user: User = await this.service.getUser(client.data.id);
    const result = await this.service.create(body, user);
    this.getByProject(body.project_id);
    return result;
  }

  @SubscribeMessage('getAllBaord')
  findAll() {
    return this.service.getAll();
  }

  @SubscribeMessage('getByIdBoard')
  findOne(@MessageBody() id: number) {
    return this.service.getById(id);
  }

  @SubscribeMessage('updateBoard')
  update(@MessageBody() body: { id: number; title: string }) {
    return this.service.update(body, body.id);
  }

  @SubscribeMessage('deleteBoard')
  async remove(@MessageBody() body: { board_id; project_id }) {
    const result = this.service.delete(body.board_id);
    this.getByProject(body.project_id);

    return result;
  }

  @SubscribeMessage('changeTicket')
  async changeTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { project_id: number; ticket_id: number; board_id: number },
  ) {
    const result = await this.service.tickteChange(
      body.ticket_id,
      body.board_id,
    );
    this.getByProject(body.project_id);
    return result;
  }

  @SubscribeMessage('boardByProject')
  async getByProject(@MessageBody() id: any) {
    const result = await this.service.getByProject(+id);
    this.server.sockets.emit('boardByProject', { data: result });
    return { data: result };
  }
}
