import { Module } from '@nestjs/common';
import { CountersService } from './counters.service';
import { CountersRepository } from './repositories/counters.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './models/counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
  ],
  providers: [CountersService, CountersRepository],
  exports: [CountersService, CountersRepository]
})
export class CountersModule {}
