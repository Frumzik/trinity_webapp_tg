/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, BadRequestException } from '@nestjs/common';
import { FileItem, FileService } from '../../service';

@Injectable()
export class AdminFileService {
  constructor(private readonly fileService: FileService) {}
  /**
   * LIST: фильтры + сортировка + пагинация
   */
  async getList({
    range,
    sort,
    filter,
  }: {
    range: [number, number];
    sort: [keyof FileItem, 'ASC' | 'DESC'];
    filter: object;
  }) {
    try {
      const { data, total } = await this.fileService.getList(
        range,
        sort,
        filter
      );

      return {
        items: data.map((el) => ({ ...el, id: el.Key })),
        total: total,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to load files');
    }
  }

  /**
   * GET ONE
   */
  async getOne(id: string) {
    const file = await this.fileService.getOne(id);
    return {
      data: { ...file, id: file.Key }, // поле data обязательно
    };
  }

  /**
   * CREATE
   */
  async create(file: Express.Multer.File) {
    try {
      if (!file) throw new BadRequestException('No file provided');

      // Загружаем файл на S3
      const url = await this.fileService.uploadFile(file);

      // Извлекаем key из URL
      // Отбрасываем базовую часть https://s3.twcstorage.ru/<bucket>/
      const parts = url.split('/');
      const key = parts.slice(4).join('/'); // убираем https://s3.twcstorage.ru/<bucket>/

      // Получаем полный объект через getOne по ключу
      const createdFile = await this.fileService.getOne(key);

      return {
        data: { ...createdFile, id: key }, // React Admin требует поле id
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * UPDATE
   */
  async update(id: string, data: any) {
    return { id: 0, data: { file: {}, id: 0 } };
  }

  /**
   * DELETE
   */
  async delete(id: string) {
    return false;
  }
}
