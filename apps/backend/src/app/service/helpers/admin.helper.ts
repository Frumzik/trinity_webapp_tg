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
  const limit: number = Number(end - start) + 1 || 10;

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

  html = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '');

  const allowedTags = [
    'b',
    'strong',
    'i',
    'em',
    'u',
    'ins',
    's',
    'strike',
    'del',
    'a',
    'code',
    'pre',
    'span',
  ] as const;

  type AllowedTag = (typeof allowedTags)[number];

  const allowedAttrs: Record<AllowedTag, string[]> = {
    b: [],
    strong: [],
    i: [],
    em: [],
    u: [],
    ins: [],
    s: [],
    strike: [],
    del: [],
    code: [],
    pre: [],
    a: ['href'],
    span: ['class'],
  };

  html = html.replace(/<([^>]+)>/gi, (match, content) => {
    const rawName = content.split(/\s+/)[0];
    const isClosing = rawName.startsWith('/');

    const tagName = rawName.replace('/', '').toLowerCase() as string;

    if (!allowedTags.includes(tagName as AllowedTag)) {
      return '';
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    const tagAllowedAttrs = allowedAttrs[tagName as AllowedTag] ?? [];
    const foundAttrs = (match.match(/\s+[\w:-]+="[^"]*"/g) || [])
      .map((attr) => {
        const [name, value] = attr.trim().split('=');
        const cleanName = name.toLowerCase();

        if (!tagAllowedAttrs.includes(cleanName)) return null;

        if (cleanName === 'class' && !/tg-spoiler/.test(value)) return null;

        return `${cleanName}=${value}`;
      })
      .filter(Boolean)
      .join(' ');

    return `<${tagName}${foundAttrs ? ' ' + foundAttrs : ''}>`;
  });

  html = html.replace(/\n{3,}/g, '\n\n');

  return html.trim();
}
