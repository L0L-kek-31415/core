import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/server/api/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto } from './auth.dto';
import { AuthHelper } from './auth.helper';
import { ProducerService } from '@/server/kafka/producer.service';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  @Inject(forwardRef(() => ProducerService))
  private readonly producerService: ProducerService;

  public async register(body: RegisterDto): Promise<User> {
    const { email, password }: RegisterDto = body;
    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new HttpException(
        'this email is already in use',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    user = new User();
    user.email = email;
    user.password = this.helper.encodePassword(password);
    const newUser: User = await this.repository.save(user);
    await this.producerService.produceUser({
      method: 'create',
      id: newUser.id,
      name: newUser.email,
    });
    return newUser;
  }

  public async login(body: LoginDto): Promise<string> {
    const { email, password }: LoginDto = body;
    const user: User = await this.repository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
    return this.helper.generateToken(user);
  }

  public async refresh(user: User): Promise<string> {
    return this.helper.generateToken(user);
  }

  async validateUser(token: string) {
    const decoded: unknown = this.helper.decode(token);
    if (!decoded) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const user: User = await this.helper.validateUser(decoded);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
