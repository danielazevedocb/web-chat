import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { UploadController } from './upload.controller';

@Module({
  imports: [ThrottlerModule],
  controllers: [UploadController],
})
export class UploadModule {}

