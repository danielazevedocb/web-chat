import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { readFile } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArquivosService } from './arquivos.service';
import { CloudStorageService } from './cloud-storage.service';
import { UploadArquivoDto } from './dto/upload-arquivo.dto';

const VALID_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@ApiTags('arquivos')
@Controller('arquivos')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ArquivosController {
  constructor(
    private readonly arquivosService: ArquivosService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!VALID_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new HttpException(
              'Tipo de arquivo não permitido',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadArquivo(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: Partial<UploadArquivoDto>,
  ) {
    if (!file) {
      throw new HttpException(
        'Arquivo não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Determine tipo de arquivo baseado no mime type
    let tipo: UploadArquivoDto['tipo'];
    if (file.mimetype.startsWith('image/')) {
      tipo = 'IMAGEM';
    } else if (file.mimetype.startsWith('video/')) {
      tipo = 'VIDEO';
    } else if (file.mimetype.startsWith('audio/')) {
      tipo = 'AUDIO';
    } else {
      tipo = 'DOCUMENTO';
    }

    let url = `/uploads/${file.filename}`;
    let thumbnailUrl: string | undefined;

    // Tentar fazer upload para Cloudinary se configurado
    if (this.cloudStorageService.isReady()) {
      try {
        const fileBuffer = await readFile(file.path);
        const uploadResult = await this.cloudStorageService.uploadBuffer(
          fileBuffer,
          file.originalname,
          'chat-attachments',
          {
            resourceType: file.mimetype.split('/')[0] === 'image' ? 'image' : 'raw',
            generateThumbnail: tipo === 'IMAGEM',
          },
        );
        
        url = uploadResult.url;
        thumbnailUrl = uploadResult.thumbnailUrl;
      } catch (error) {
        console.error('Erro ao fazer upload para Cloudinary:', error);
        // Continua com armazenamento local em caso de erro
      }
    }

    const arquivoData: UploadArquivoDto = {
      nome: file.filename,
      nomeOriginal: file.originalname,
      url,
      tipo,
      tamanho: file.size,
      mimeType: file.mimetype,
      conversaId: data.conversaId,
      mensagemId: data.mensagemId,
      thumbnail: thumbnailUrl,
    };

    return this.arquivosService.uploadArquivo(arquivoData);
  }

  @Get(':id')
  getArquivo(@Param('id') id: string) {
    return this.arquivosService.findArquivo(id);
  }

  @Get('conversa/:conversaId')
  getArquivosPorConversa(@Param('conversaId') conversaId: string) {
    return this.arquivosService.findArquivosPorConversa(conversaId);
  }
}
