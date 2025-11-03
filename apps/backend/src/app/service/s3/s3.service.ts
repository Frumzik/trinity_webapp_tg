import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectS3 } from 'nestjs-s3';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  type S3,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly bucket: string;

  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly configService: ConfigService
  ) {
    this.bucket = this.configService.get<string>('S3_BUCKET') ?? '';
  }

  async listBuckets() {
    try {
      const result = await this.s3.listBuckets({});
      return (
        result.Buckets?.map((bucket) => ({
          name: bucket.Name,
          createdAt: bucket.CreationDate,
        })) ?? []
      );
    } catch (error) {
      console.error('Ошибка при получении списка bucket:', error);
      throw new InternalServerErrorException(
        'Не удалось получить список bucket'
      );
    }
  }

  async uploadFile(file: Express.Multer.File, key?: string): Promise<string> {
    try {
      if (!key) {
        key = `${this.configService.get('S3_FOLDER') ?? 'uploads'}/${Date.now()}-${
          file.originalname
        }`;
      }

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // Возвращаем прямую ссылку на файл
      const endpoint =
        this.configService.get<string>('AWS_S3_ENDPOINT') ||
        `https://s3.twcstorage.ru/${this.bucket}`;
      return `${endpoint}/${key.split('/').map(encodeURIComponent).join('/')}`;
    } catch (error) {
      console.error('Ошибка при загрузке файла в S3:', error);
      throw new InternalServerErrorException('Не удалось загрузить файл');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch (error) {
      console.error('Ошибка при удалении файла из S3:', error);
      throw new InternalServerErrorException('Не удалось удалить файл');
    }
  }
}
