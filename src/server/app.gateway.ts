import { Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './api/user/auth/auth.service';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  @Inject(AuthService)
  private readonly authService: AuthService;

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization.split(' ')[1];
      const payload = await this.authService.validateUser(token);
      console.log('client connected');
      client.data = { user: payload };
    } catch (err) {
      console.log('fuck', err);
      client.disconnect();
    }
  }

  async handleDisconnect() {
    console.log('client disconnected');
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }
}
