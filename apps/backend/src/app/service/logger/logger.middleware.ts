/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body: requestBody } = req;
    const start = Date.now();

    const oldWrite = res.write.bind(res);
    const oldEnd = res.end.bind(res);

    const chunks: Buffer[] = [];

    // -----------------------------
    // res.write
    // -----------------------------
    res.write = function (
      chunk: any,
      encodingOrCb?: BufferEncoding | ((err?: Error | null) => void),
      cb?: (err?: Error | null) => void
    ): boolean {
      try {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      } catch { /* empty */ }

      // write(chunk, callback)
      if (typeof encodingOrCb === 'function') {
        return oldWrite(chunk, encodingOrCb);
      }

      // write(chunk, encoding, callback)
      const encoding: BufferEncoding = encodingOrCb ?? 'utf8';
      return oldWrite(chunk, encoding, cb);
    } as any;

    // -----------------------------
    // res.end
    // -----------------------------
    res.end = function (
      chunk?: any,
      encodingOrCb?: BufferEncoding | (() => void),
      cb?: () => void
    ): Response {
      try {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      } catch { /* empty */ }

      // end(chunk, callback)
      if (typeof encodingOrCb === 'function') {
        return oldEnd(chunk, encodingOrCb);
      }

      // end(chunk, encoding, callback)
      const encoding: BufferEncoding = encodingOrCb ?? 'utf8';
      return oldEnd(chunk, encoding, cb);
    } as any;

    // -----------------------------
    // Завершение ответа
    // -----------------------------
    res.on('finish', () => {
      let responseBody = '';

      try {
        responseBody = Buffer.concat(chunks).toString('utf8');
      } catch {
        responseBody = '<unreadable>';
      }

      const ms = Date.now() - start;

      this.logger.log(
        JSON.stringify({
          method,
          url: originalUrl,
          status: res.statusCode,
          duration_ms: ms,
          request_body: requestBody,
          response_body: responseBody,
        })
      );
    });

    next();
  }
}
