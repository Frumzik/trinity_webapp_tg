import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectS3 } from 'nestjs-s3';
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type S3,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export interface FileItem {
  Key: string;
  LastModified?: Date;
  Size?: number;
  ETag?: string;
  StorageClass?: string;
  url: string;
}

@Injectable()
export class FileService {
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
        key = `${
          this.configService.get('S3_FOLDER') ?? 'uploads'
        }/${Date.now()}-${file.originalname}`;
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

  async getList(
    range: [number, number],
    sort: [keyof FileItem, 'ASC' | 'DESC'],
    filter: object
  ): Promise<{ data: FileItem[]; total: number }> {
    try {
      // Парсим параметры
      const [start, end] = range;
      const [sortField, sortOrder] = sort;
      const filterObj = filter ? filter : {};

      // Получаем список объектов из S3
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: this.configService.get('S3_FOLDER') ?? 'uploads/',
        })
      );

      let files: FileItem[] =
        result.Contents?.map((item) => {
          const key = item.Key as string;
          const endpoint =
            this.configService.get<string>('AWS_S3_ENDPOINT') ||
            `https://s3.twcstorage.ru/${this.bucket}`;
          return {
            Key: key,
            LastModified: item.LastModified,
            Size: item.Size,
            ETag: item.ETag,
            StorageClass: item.StorageClass,
            url: `${endpoint}/${key
              .split('/')
              .map(encodeURIComponent)
              .join('/')}`,
          };
        }) ?? [];

      // Фильтрация
      files = files.filter((file) => {
        return Object.entries(filterObj).every(([field, value]) => {
          return String(file[field as keyof FileItem] || '')
            .toLowerCase()
            .includes(String(value).toLowerCase());
        });
      });

      files.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Если сортируем по дате, приводим к числу
        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();

        // Если undefined, ставим в конец
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Сравнение чисел или строк
        if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
        return 0;
      });

      const total = files.length;

      // Пагинация
      const data = files.slice(start, end + 1);

      return { data, total };
    } catch (error) {
      console.error('Ошибка при получении списка файлов из S3:', error);
      throw new InternalServerErrorException(
        'Не удалось получить список файлов'
      );
    }
  }

  /**
   * Получить один файл по ключу
   */
  async getOne(key: string): Promise<FileItem> {
    try {
      // Проверяем, существует ли файл в S3
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: key,
          MaxKeys: 1,
        })
      );

      const item = result.Contents?.[0];
      if (!item) {
        throw new InternalServerErrorException(
          `Файл с ключом ${key} не найден`
        );
      }

      const endpoint =
        this.configService.get<string>('AWS_S3_ENDPOINT') ||
        `https://s3.twcstorage.ru/${this.bucket}`;

      key = item.Key as string;

      return {
        Key: key,
        LastModified: item.LastModified,
        Size: item.Size,
        ETag: item.ETag,
        StorageClass: item.StorageClass,
        url: `${endpoint}/${key.split('/').map(encodeURIComponent).join('/')}`,
      };
    } catch (error) {
      console.error(`Ошибка при получении файла ${key}:`, error);
      throw new InternalServerErrorException(`Не удалось получить файл ${key}`);
    }
  }
}
