import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string, env: any } {
    return { message: 'HelloAPI', env: process.env };
  }
}
