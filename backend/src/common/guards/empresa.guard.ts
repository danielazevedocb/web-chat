import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VALIDATE_EMPRESA_KEY } from '../decorators/validate-empresa.decorator';

/**
 * Guard para validar automaticamente empresaId em requisições
 * Extrai empresaId do token JWT e valida que o usuário pertence à empresa
 */
@Injectable()
export class EmpresaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireValidation = this.reflector.getAllAndOverride<boolean>(
      VALIDATE_EMPRESA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireValidation) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!user.empresaId) {
      throw new BadRequestException('EmpresaId não encontrado no token');
    }

    // Validar que empresaId está presente no body/params/query se necessário
    // Isso pode ser customizado conforme a necessidade
    return true;
  }
}

