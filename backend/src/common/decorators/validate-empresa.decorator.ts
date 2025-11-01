import { SetMetadata } from '@nestjs/common';

export const VALIDATE_EMPRESA_KEY = 'validateEmpresa';

/**
 * Decorator para marcar métodos que requerem validação automática de empresaId
 * Use este decorator em métodos de serviço para garantir que empresaId seja validado
 */
export const ValidateEmpresa = () => SetMetadata(VALIDATE_EMPRESA_KEY, true);

