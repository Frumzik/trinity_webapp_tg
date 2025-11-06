import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

class DeleteFileDto {
  key!: string;
}

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // ──────────────── LIST BUCKETS ────────────────
  @Get('buckets')
  @ApiOperation({ summary: 'Получить список бакетов S3' })
  @ApiResponse({ status: 200, description: 'Список бакетов' })
  async listBuckets() {
    return await this.fileService.listBuckets();
  }

  // ──────────────── UPLOAD FILE ────────────────
  @Post('upload')
  @ApiOperation({ summary: 'Загрузить файл в S3' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Файл для загрузки',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Ссылка на загруженный файл', type: String })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('Файл не предоставлен');
    }
    return await this.fileService.uploadFile(file);
  }

  // ──────────────── DELETE FILE ────────────────
  @Delete('delete')
  @ApiOperation({ summary: 'Удалить файл из S3 по ключу' })
  @ApiResponse({ status: 200, description: 'Файл удалён успешно' })
  async deleteFile(@Body() body: DeleteFileDto) {
    if (!body.key) {
      throw new InternalServerErrorException('Не указан ключ файла');
    }
    await this.fileService.deleteFile(body.key);
    return { message: 'Файл удалён успешно' };
  }
}
