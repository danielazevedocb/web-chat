import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const configService = app.get(ConfigService);
  
  // Logger
  app.useLogger(app.get(Logger));

  // Security
  app.use(helmet());
  app.use(compression());
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new LoggerErrorInterceptor(),
  );

  // CORS - Suporta múltiplas origens separadas por vírgula
  const corsOrigins = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  const allowedOrigins = corsOrigins.split(',').map((origin) => origin.trim());
  
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      // Permite se estiver na lista ou se for desenvolvimento
      if (
        allowedOrigins.includes(origin) ||
        configService.get('NODE_ENV') === 'development'
      ) {
        return callback(null, true);
      }
      
      callback(new Error('Não permitido pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory
  const express = require('express');
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Sistema de Atendimento Multi-Empresa')
    .setDescription(
      'API completa de atendimento ao cliente com chat em tempo real, IA integrada e sistema multi-tenancy',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação e autorização')
    .addTag('empresas', 'Gestão de empresas')
    .addTag('usuarios', 'Gestão de usuários')
    .addTag('clientes', 'Gestão de clientes')
    .addTag('chat', 'Chat em tempo real')
    .addTag('tickets', 'Sistema de tickets')
    .addTag('agendamentos', 'Agendamentos')
    .addTag('ia', 'Integração com IA')
    .addTag('arquivos', 'Upload de arquivos')
    .addTag('dashboard', 'Métricas e relatórios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📊 Ambiente: ${configService.get('NODE_ENV')}`);
  console.log(`📚 Documentação: http://localhost:${port}/api/docs`);
}

bootstrap();
