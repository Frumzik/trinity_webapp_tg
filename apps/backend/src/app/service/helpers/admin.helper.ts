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





export function sanitizeTelegramHtml(html: string): string {
  if (!html) return '';

  // 1. Нормализация переносов
  html = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '');

  // 2. Разрешённые теги Telegram
  const allowedTags = [
    'b', 'strong',
    'i', 'em',
    'u', 'ins',
    's', 'strike', 'del',
    'a',
    'code', 'pre',
    'span'
  ];

  // 3. Разрешённые атрибуты
  const allowedAttrs = {
    a: ['href'],
    span: ['class'] // только class="tg-spoiler"
  };

  // 4. Удаляем все другие теги, но оставляем содержимое
  html = html.replace(/<([^>]+)>/gi, (match, tagContent) => {
    const parts = tagContent.split(/\s+/);
    const tagName = parts[0].toLowerCase().replace(/\//, '');

    if (!allowedTags.includes(tagName)) {
      // запрещенный тег → вырезаем его
      return '';
    }

    // 5. Оставляем только разрешённые атрибуты
    const attrsAllowed = allowedAttrs[tagName] || [];
    const cleanedAttrs = (match.match(/\s+[\w-]+="[^"]*"/g) || [])
      .map(attr => {
        const [name, value] = attr.trim().split('=');
        const cleanName = name.toLowerCase();

        if (!attrsAllowed.includes(cleanName)) return null;

        if (cleanName === 'class' && !/tg-spoiler/.test(value)) return null;

        return `${cleanName}=${value}`;
      })
      .filter(Boolean)
      .join(' ');

    return `<${tagContent.startsWith('/') ? '/' : ''}${tagName}${cleanedAttrs ? ' ' + cleanedAttrs : ''}>`;
  });

  // 6. Удаляем лишние пустые строки
  html = html.replace(/\n{3,}/g, '\n\n');

  // 7. Тримим пробелы
  return html.trim();
}
