import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgendamentosModule } from './modules/agendamentos/agendamentos.module';
import { ArquivosModule } from './modules/arquivos/arquivos.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { IAModule } from './modules/ia/ia.module';
import { IntegracoesModule } from './modules/integracoes/integracoes.module';
import { MessagesModule } from './modules/messages/messages.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
      {
        name: 'login',
        ttl: 900000, // 15 minutos
        limit: 5, // 5 tentativas de login
      },
      {
        name: 'ia',
        ttl: 60000, // 1 minuto
        limit: 20, // 20 requisições de IA
      },
      {
        name: 'upload',
        ttl: 3600000, // 1 hora
        limit: 10, // 10 uploads por hora
      },
    ]),
    PrismaModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    ClientesModule,
    ChatModule,
    MessagesModule,
    TicketsModule,
    AgendamentosModule,
    IAModule,
    ArquivosModule,
    UploadModule,
    IntegracoesModule,
    DashboardModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
