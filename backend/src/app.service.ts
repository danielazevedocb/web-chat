import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Sistema de Atendimento Multi-Empresa com IA - Backend API';
  }
}
