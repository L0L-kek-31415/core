import {
  ClassSerializerInterceptor,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { Ticket } from './ticket.entity';
import { Request } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto, ShowTicketDto } from './ticket.dto';
import { ApiTags } from '@nestjs/swagger';
import { DecorateAll } from 'decorate-all';
import { User } from '../user/user.entity';

@ApiTags('Ticket')
@Controller('ticket')
@DecorateAll(UseGuards(JwtAuthGuard))
@DecorateAll(UseInterceptors(ClassSerializerInterceptor))
export class TicketController {
  @Inject(TicketService)
  protected readonly service: TicketService;

  @Get('')
  protected getAll(): Promise<Ticket[]> {
    return this.service.getAll();
  }

  @Post('')
  protected create(
    @Req() req: Request,
    @Body() body: CreateTicketDto,
  ): Promise<ShowTicketDto> {
    const user = <User>req.user;
    return this.service.create(body, user);
  }

  @Put(':id')
  protected update(
    @Req() req: Request,
    @Body() body: { title?: string; description?: string },
    @Param('id') id: number,
  ): Promise<ShowTicketDto> {
    try {
      return this.service.update(req, body, id);
    } catch (error) {
      return error;
    }
  }

  @Delete(':id')
  protected delete(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<string> {
    return this.service.delete(id, req);
  }

  @Post(':id/board')
  protected board(
    @Body() body: { board_id: number },
    @Param('id') id: number,
  ): Promise<ShowTicketDto> {
    return this.service.board(id, body.board_id);
  }

  @Get(':id')
  protected getById(@Param('id') id: number): Promise<ShowTicketDto> {
    return this.service.getById(id);
  }
}
