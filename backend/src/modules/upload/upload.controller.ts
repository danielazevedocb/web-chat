import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  'audio/webm',
  'video/mp4',
  'video/webm',
];

// Garantir que o diretório de uploads existe
const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller('upload')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class UploadController {
  @Throttle({ upload: { limit: 10, ttl: 3600000 } })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (VALID_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              `Tipo de arquivo não permitido: ${file.mimetype}`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        'Arquivo não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Determinar tipo baseado no mime type
    let type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' = 'FILE';
    if (file.mimetype.startsWith('image/')) {
      type = 'IMAGE';
    } else if (file.mimetype.startsWith('video/')) {
      type = 'VIDEO';
    } else if (file.mimetype.startsWith('audio/')) {
      type = 'AUDIO';
    }

    const fileUrl = `/uploads/${file.filename}`;

    return {
      url: fileUrl,
      type,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }
}

