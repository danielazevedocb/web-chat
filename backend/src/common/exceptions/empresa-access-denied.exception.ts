import { ForbiddenException } from '@nestjs/common';

export class EmpresaAccessDeniedException extends ForbiddenException {
  constructor(message?: string) {
    super(
      message || 'Acesso negado: recurso não pertence à sua empresa',
    );
  }
}

