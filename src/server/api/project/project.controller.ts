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
import { CreateProjectDto, ShowProjectDto } from './project.dto';
import { Request } from 'express';
import { ProjectService } from './project.service';
import { ApiTags } from '@nestjs/swagger';
import { DecorateAll } from 'decorate-all';
import { HasRoles } from '../user/auth/roles.decorator';
import { RoleEnumType } from '../user/user.entity';

@ApiTags('Project')
@Controller('project')
@DecorateAll(UseGuards(JwtAuthGuard, RolesGuard))
@DecorateAll(UseInterceptors(ClassSerializerInterceptor))
export class ProjectController {
  @Inject(ProjectService)
  protected readonly service: ProjectService;

  @Get('')
  protected getAll(@Req() req: Request): Promise<ShowProjectDto[]> {
    return this.service.getAll(req);
  }

  @Get(':id')
  protected getById(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ShowProjectDto> {
    return this.service.getById(id);
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Put(':id')
  protected update(
    @Req() req: Request,
    @Body() body: { title?: string; description?: string },
    @Param('id') id: number,
  ): Promise<ShowProjectDto> {
    return this.service.update(req, body, id);
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Post('')
  protected create(
    @Req() req: Request,
    @Body() body: CreateProjectDto,
  ): Promise<ShowProjectDto> {
    return this.service.create(body, req);
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Delete(':id')
  protected delete(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<string> {
    return this.service.delete(id, req);
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Post(':id/member')
  protected member(
    @Req() req: Request,
    @Body() body: { member_id: number },
    @Param('id') id: number,
  ): Promise<ShowProjectDto> {
    return this.service.member(id, body, req);
  }

  @HasRoles(RoleEnumType.ADMIN)
  @Post(':id/board')
  protected board(
    @Req() req: Request,
    @Body() body: { board_id: number },
    @Param('id') id: number,
  ): Promise<ShowProjectDto> {
    return this.service.board(id, body.board_id, req);
  }
}
