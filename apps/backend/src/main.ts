/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import {
  AllExceptionsFilter,
  ResponseTransformInterceptor,
} from './app/service';

async function bootstrap() {
  const globalPrefix = '';
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует типы (например, string → number),
      errorHttpStatusCode: 400, // возвращаем BadRequest при ошибках
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Trinity API')
    .setDescription('Документация по API сервиса обучения')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Введите токен в формате: Bearer <JWT>',
        in: 'header',
      },
      'access_token' // 👈 имя схемы безопасности (можно любое)
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
