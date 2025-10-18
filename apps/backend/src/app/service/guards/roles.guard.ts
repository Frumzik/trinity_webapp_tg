import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем список требуемых ролей из метаданных (см. декоратор ниже)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // если роли не указаны — доступ открыт
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }

    // Проверяем, есть ли у пользователя нужная роль
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Доступ запрещён: требуется роль администратора или модератора');
    }

    return true;
  }
}
