import {
  ClassSerializerInterceptor,
  Controller,
  Req,
  UseGuards,
  UseInterceptors,
  Put,
  Inject,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@/server/api/user/auth/auth.guard';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { DecorateAll } from 'decorate-all';

@ApiTags('User')
@Controller('user')
@DecorateAll(UseGuards(JwtAuthGuard))
@DecorateAll(UseInterceptors(ClassSerializerInterceptor))
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Put('role')
  private updateName(@Req() req: Request): Promise<User> {
    return this.service.updateName(req);
  }

  @Get('')
  private getAll(): Promise<User[]> {
    return this.service.getAll();
  }
  @Get('me')
  private me(@Req() req: Request): Promise<User> {
    return this.service.me(req);
  }
}
