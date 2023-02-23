import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../user/auth/auth.guard';
import { BoardService } from './board.service';
import { Request } from 'express';
import { CreateBoardDto, ShowBoardDto } from './board.dto';
import { ApiTags } from '@nestjs/swagger';
import { DecorateAll } from 'decorate-all';
import { HasRoles } from '../user/auth/roles.decorator';
import { RoleEnumType, User } from '../user/user.entity';

@ApiTags('Boards')
@Controller('board')
@DecorateAll(UseGuards(JwtAuthGuard, RolesGuard))
@DecorateAll(UseInterceptors(ClassSerializerInterceptor))
export class BoardController {
  @Inject(BoardService)
  protected readonly service: BoardService;

  @Get('')
  protected getAll(): Promise<ShowBoardDto[]> {
    return this.service.getAll();
  }

  @Get('/project/:id')
  protected getByProject(@Param('id') id: number): Promise<ShowBoardDto[]> {
    const result = this.service.getByProject(id);
    return result;
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Post('')
  protected create(
    @Req() req: Request,
    @Body() body: CreateBoardDto,
  ): Promise<ShowBoardDto> {
    const user: User = <User>req.user;

    const result = this.service.create(body, user);
    return result;
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Put(':id')
  protected update(
    @Body() body: { title: string },
    @Param('id') id: number,
  ): Promise<ShowBoardDto> {
    const result = this.service.update(body, id);
    return result;
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Delete(':id')
  protected delete(@Param('id') id: number): Promise<any> {
    return this.service.delete(id);
  }

  @Get(':id')
  protected getById(@Param('id') id: number): Promise<ShowBoardDto> {
    return this.service.getById(id);
  }

  @Post(':id/ticket')
  protected ticket(
    @Body() body: { ticket_id: number },
    @Param('id') id: number,
  ): Promise<any> {
    return this.service.tickteChange(body.ticket_id, id);
  }
}
