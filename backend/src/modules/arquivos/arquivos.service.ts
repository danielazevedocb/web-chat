import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadArquivoDto } from './dto/upload-arquivo.dto';

@Injectable()
export class ArquivosService {
  constructor(private prisma: PrismaService) {}

  async uploadArquivo(data: UploadArquivoDto) {
    return this.prisma.arquivo.create({
      data: {
        nome: data.nome,
        nomeOriginal: data.nomeOriginal,
        url: data.url,
        tipo: data.tipo,
        tamanho: data.tamanho,
        mimeType: data.mimeType,
        thumbnail: data.thumbnail,
        conversaId: data.conversaId,
        mensagemId: data.mensagemId,
      },
    });
  }

  async findArquivo(id: string) {
    const arquivo = await this.prisma.arquivo.findUnique({
      where: { id },
    });

    if (!arquivo) {
      throw new HttpException('Arquivo não encontrado', HttpStatus.NOT_FOUND);
    }

    return arquivo;
  }

  async findArquivosPorConversa(conversaId: string) {
    return this.prisma.arquivo.findMany({
      where: { conversaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteArquivo(id: string) {
    const arquivo = await this.findArquivo(id);
    
    // TODO: Deletar arquivo físico do storage
    
    return this.prisma.arquivo.delete({
      where: { id },
    });
  }
}
