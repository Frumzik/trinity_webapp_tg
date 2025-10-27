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
