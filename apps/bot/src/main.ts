/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует типы (например, string → number),
      errorHttpStatusCode: 400, // возвращаем BadRequest при ошибках
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

bootstrap();
