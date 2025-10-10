import { Injectable } from '@nestjs/common';
import { CountersRepository } from './repositories/counters.repository';
import { CounterType } from '@trinity/shared';

@Injectable()
export class CountersService {
  constructor(private readonly counterRepository: CountersRepository) {}

  async getNextSequence(type: CounterType): Promise<number> {
    return this.counterRepository.getNextSequence(type);
  }

  async saveNextSequence(type: CounterType): Promise<number> {
    return this.counterRepository.saveNextSequence(type);
  }
}
