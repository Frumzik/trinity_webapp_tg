import { Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './file.service';
import { getS3Config } from '../config';
import { FileController } from './file.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    S3Module.forRootAsync(getS3Config()),
  ],
  providers: [FileService],
  exports: [FileService],
  controllers: [FileController]
})
export class FileModule {}
