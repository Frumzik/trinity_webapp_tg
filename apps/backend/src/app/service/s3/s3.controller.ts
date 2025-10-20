import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  // 📤 Загрузка файла
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'Файл не получен' };
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;
    const url = await this.s3Service.uploadFile(key, file);
    return { key, url };
  }

  // 🗑 Удаление файла
  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.s3Service.deleteFile(key);
    return { message: `Файл ${key} успешно удалён` };
  }

  // 📦 Получение списка бакетов
  @Get('buckets')
  async listBuckets() {
    return this.s3Service.listBuckets();
  }
}
