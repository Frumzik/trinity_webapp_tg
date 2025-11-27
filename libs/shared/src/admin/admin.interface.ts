/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery } from 'mongoose';

export interface GetListOptions<T> {
  skip?: number; // пропустить N элементов
  limit?: number; // максимальное количество
  sort?: Record<string, 1 | -1>; // сортировка по полям модели
  filter?: FilterQuery<T>; // фильтр,
  populate?: string[];
}

export interface ParsedGetListOptions<T> {
  skip: number; // пропустить N элементов
  limit: number; // максимальное количество
  sort: Record<string, 1 | -1>; // сортировка по полям модели
  filter: FilterQuery<T>; // фильтр,
}
