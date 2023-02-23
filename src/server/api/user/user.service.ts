import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { RoleEnumType, User } from './user.entity';
import { ProducerService } from '@/server/kafka/producer.service';
import { AuthService } from './auth/auth.service';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(ProducerService)
  private readonly producerService: ProducerService;

  @Inject(AuthService)
  private readonly authService: AuthService;

  async validateUser(token: string) {
    return this.authService.validateUser(token);
  }
  async getAll(): Promise<User[]> {
    return this.repository.createQueryBuilder('user').getMany();
  }
  public async updateName(req: Request): Promise<User> {
    const user: User = <User>req.user;
    if (user.role == RoleEnumType.ADMIN) {
      user.role = RoleEnumType.USER;
    } else {
      user.role = RoleEnumType.ADMIN;
    }

    return this.repository.save(user);
  }

  async me(req: Request): Promise<User> {
    return <User>req.user;
  }

  async getById(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id: id } });
  }
  async getByIdWithJoin(id: number, field: string): Promise<User> {
    return await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect(`user.${field}`, field)
      .where('user.id = :id', { id: id })
      .getOne();
  }

  async isOwner(req: Request, owner_id): Promise<void> {
    const user: User = <User>req.user;
    if (user.id !== owner_id && user.role !== 'admin') {
      throw new HttpException(
        "You don't have permission",
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
