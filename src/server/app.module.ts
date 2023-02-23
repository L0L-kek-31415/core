import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getEnvPath } from './common/helper/env.helper';
import { TypeOrmConfigService } from '@/shared/typeorm/typeorm.service';
import { ApiModule } from './api/api.module';
import { KafkaModule } from './kafka/kafka.module';
import { WebSocketGateway } from '@nestjs/websockets';
import { AppGateway } from './app.gateway';
import { AuthModule } from './api/user/auth/auth.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@WebSocketGateway()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ApiModule,
    AuthModule,
    KafkaModule,
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
