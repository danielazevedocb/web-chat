import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArquivosController } from './arquivos.controller';
import { ArquivosService } from './arquivos.service';
import { CloudStorageService } from './cloud-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [ArquivosController],
  providers: [ArquivosService, CloudStorageService],
  exports: [ArquivosService, CloudStorageService],
})
export class ArquivosModule {}
