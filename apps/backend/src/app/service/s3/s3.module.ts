import { Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';
import { getS3Config } from '../config';
import { S3Controller } from './s3.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    S3Module.forRootAsync(getS3Config()),
  ],
  providers: [S3Service],
  exports: [S3Service],
  controllers: [S3Controller]
})
export class S3ProviderModule {}
