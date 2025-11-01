import { NotFoundException } from '@nestjs/common';

export class EmpresaNotFoundException extends NotFoundException {
  constructor(empresaId?: string) {
    super(
      empresaId
        ? `Empresa com ID ${empresaId} não encontrada`
        : 'Empresa não encontrada',
    );
  }
}

