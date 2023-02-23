import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Partitioners, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['kafka:9092'],
    clientId: 'kek',
  });

  private readonly producer: Producer = this.kafka.producer({
    allowAutoTopicCreation: true,
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  async onModuleInit() {
    await this.producer.connect();
  }
  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async produceUser(value: any) {
    await this.produce({
      topic: 'user',
      messages: [
        {
          value: JSON.stringify(value),
        },
      ],
    });
    Logger.debug('producer complete user');
  }

  async produceProject(value: any) {
    await this.produce({
      topic: 'project',
      messages: [
        {
          value: JSON.stringify(value),
        },
      ],
    });
    Logger.debug('producer complete user');
  }
  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
