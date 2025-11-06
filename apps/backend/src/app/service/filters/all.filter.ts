import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Если это HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as
        | string
        | { message?: string | string[] };

      let message: string[] = [];

      if (typeof res === 'string') {
        message = [res];
      } else if (res.message) {
        message = Array.isArray(res.message) ? res.message : [res.message];
      }

      return response.status(status).json({
        statusCode: status,
        success: false,
        error: status === 500 ? 'Internal Server Error' : 'Bad Request',
        message,
      });
    }

    // Для обычных Error
    const err = exception as Error;
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      error: 'Internal Server Error',
      message: [err.message || 'Unknown error'],
    });
  }
}
