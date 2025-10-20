import { ConfigModule, ConfigService } from "@nestjs/config";

export const getS3Config = () => {
  return {
    useFactory: (configService: ConfigService) => ({
      config: {
        credentials: {
          accessKeyId: configService.get('S3_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
        },
        region: configService.get('S3_REGION'),
        endpoint: configService.get('S3_ENDPOINT'),
        forcePathStyle: true,
        signatureVersion: 'v4',
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
  };
};
