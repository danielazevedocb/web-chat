import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  thumbnailUrl?: string;
}

@Injectable()
export class CloudStorageService {
  private readonly logger = new Logger(CloudStorageService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary configurado com sucesso');
    } else {
      this.logger.warn(
        'Cloudinary não configurado. Usando armazenamento local.',
      );
    }
  }

  async uploadFile(
    filePath: string,
    folder = 'uploads',
    options?: { resourceType?: string; generateThumbnail?: boolean },
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary não está configurado');
    }

    try {
      const uploadOptions: any = {
        folder: folder,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        resource_type: options?.resourceType || 'auto',
      };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      const uploadResult: UploadResult = {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };

      // Gerar thumbnail para imagens
      if (
        options?.generateThumbnail &&
        result.resource_type === 'image' &&
        result.format !== 'svg'
      ) {
        uploadResult.thumbnailUrl = cloudinary.url(result.public_id, {
          transformation: [
            { width: 200, height: 200, crop: 'fill' },
            { quality: 'auto' },
          ],
        });
      }

      this.logger.log(`Arquivo enviado para Cloudinary: ${uploadResult.url}`);

      return uploadResult;
    } catch (error) {
      this.logger.error('Erro ao fazer upload para Cloudinary:', error);
      throw error;
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    folder = 'uploads',
    options?: { resourceType?: string; generateThumbnail?: boolean },
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary não está configurado');
    }

    try {
      const uploadOptions: any = {
        folder: folder,
        public_id: fileName.replace(/[^a-z0-9]/gi, '_'),
        resource_type: options?.resourceType || 'auto',
        overwrite: false,
      };

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              this.logger.error('Erro ao fazer upload para Cloudinary:', error);
              reject(error);
              return;
            }

            const uploadResult: UploadResult = {
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
            };

            // Gerar thumbnail para imagens
            if (
              options?.generateThumbnail &&
              result.resource_type === 'image' &&
              result.format !== 'svg'
            ) {
              uploadResult.thumbnailUrl = cloudinary.url(result.public_id, {
                transformation: [
                  { width: 200, height: 200, crop: 'fill' },
                  { quality: 'auto' },
                ],
              });
            }

            this.logger.log(`Arquivo enviado para Cloudinary: ${uploadResult.url}`);
            resolve(uploadResult);
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      this.logger.error('Erro ao fazer upload para Cloudinary:', error);
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary não está configurado');
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Arquivo deletado do Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.error('Erro ao deletar arquivo do Cloudinary:', error);
      throw error;
    }
  }

  getSignedUrl(publicId: string, options?: any): string {
    if (!this.isConfigured) {
      throw new Error('Cloudinary não está configurado');
    }

    return cloudinary.url(publicId, options);
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}
