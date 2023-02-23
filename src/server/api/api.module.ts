import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TicketModule } from './ticket/ticket.module';
import { BoardModule } from './board/board.module';
import { ProjectModule } from './project/project.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    forwardRef(() => TicketModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => BoardModule),
    forwardRef(() => KafkaModule),
  ],
})
export class ApiModule {}
