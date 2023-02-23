import { KafkaModule } from '@/server/kafka/kafka.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from '../project/project.module';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardGateway } from './board.gateway';
import { BoardService } from './board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    forwardRef(() => TicketModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => KafkaModule),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardGateway],
  exports: [BoardService],
})
export class BoardModule {}
