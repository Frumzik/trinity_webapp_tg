import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

export const winstonConfig = {
  transports: [
    new LokiTransport({
      host: 'http://loki:3100', // URL Loki
      labels: { service: 'trinity' },
      json: true,
      replaceTimestamp: true,
    }),

    // Дополнительно вывод в консоль
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
  ],
};
