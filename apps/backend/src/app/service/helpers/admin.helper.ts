/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParsedGetListOptions } from '@trinity/shared';
import { FilterQuery } from 'mongoose';

/**
 * Преобразует query-параметры React-admin в GetListOptions для репозитория
 */
export function parseGetListQuery<T = any>(params: {
  range: string;
  sort: string;
  filter: string;
}): ParsedGetListOptions<T> {
  const { range: rangeRaw, sort: sortRaw, filter: filterRaw } = params;

  // RANGE -> skip / limit
  const [start = 0, end = 10] = rangeRaw ? JSON.parse(rangeRaw) : [0, 10];
  const skip: number = Number(start) || 0;
  const limit: number = Number(end - start) || 10;

  // SORT -> объект { field: 1 | -1 }
  let sort: Record<string, 1 | -1> = {};
  if (sortRaw) {
    const [sortField, sortOrder]: [string, 'ASC' | 'DESC'] =
      JSON.parse(sortRaw);
    sort = { [sortField]: sortOrder === 'ASC' ? 1 : -1 };
  }

  // FILTER
  const filter: FilterQuery<T> = filterRaw ? JSON.parse(filterRaw) : {};

  return {
    skip,
    limit,
    sort,
    filter,
  };
}
