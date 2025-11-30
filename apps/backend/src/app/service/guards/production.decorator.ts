import { CanActivate, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProdcutionGuard implements CanActivate {
  canActivate(): boolean {
    if (process.env.NODE_ENV !== 'production') {
      throw new ForbiddenException(
        'Access denied: NODE_ENV must be production.'
      );
    }

    return true;
  }
}
