import { TipoArquivo } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UploadArquivoDto {
  @IsString()
  nome: string;

  @IsString()
  nomeOriginal: string;

  @IsString()
  url: string;

  @IsEnum(TipoArquivo)
  tipo: TipoArquivo;

  @IsNumber()
  @Min(0)
  @Max(100 * 1024 * 1024) // 100MB
  tamanho: number;

  @IsString()
  mimeType: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  conversaId?: string;

  @IsString()
  @IsOptional()
  mensagemId?: string;
}
