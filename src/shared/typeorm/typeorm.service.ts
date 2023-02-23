import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.get<string>('DATABASE_HOST') || 'postgres',
      port: this.config.get<number>('DATABASE_PORT') || 5432,
      database: this.config.get<string>('DATABASE_NAME') || 'postgres',
      username: this.config.get<string>('DATABASE_USER') || 'postgres',
      password: this.config.get<string>('DATABASE_PASSWORD') || 'postgres',
      entities: ['dist/**/**/*.entity.{ts,js}'],
      subscribers: ['dist/**/**/*.subscriber.{ts,js}'],
      migrations: ['dist/migrations/*.{ts,js}'],
      migrationsTableName: 'typeorm_migrations',
      logger: 'file',
      synchronize: true, // never use TRUE in production!
    };
  }
}
