import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Если ошибка NestJS (HttpException)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message || 'Unexpected error';

      console.error('HTTP Exception:', {
        status,
        message,
        path: request.url,
      });

      return response.status(status).json({
        ok: false,
        status,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // Если ошибка не из HttpException
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    console.error('UNHANDLED ERROR:', exception);

    return response.status(status).json({
      ok: false,
      status,
      message: 'Internal server error',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (exception as any)?.message ?? exception,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
