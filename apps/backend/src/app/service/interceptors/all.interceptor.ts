import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { BaseResponseDto } from './base.dto';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();

    // Отключаем интерцептор для admin маршрутов
    if (req.url.startsWith('/admin')) {
      return next.handle();
    }

    return next.handle().pipe(
      map(
        (data) =>
          new BaseResponseDto<typeof data>({
            success: true,
            data,
            message: ['OK'],
          })
      )
    );
  }
}
