import { forwardRef, Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket } from './ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from '../board/board.module';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';
import { KafkaModule } from '@/server/kafka/kafka.module';
import { TicketGateway } from './ticket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    forwardRef(() => UserModule),
    forwardRef(() => BoardModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => KafkaModule),
  ],
  providers: [TicketService, TicketGateway],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
