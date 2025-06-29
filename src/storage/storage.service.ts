// src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl} from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
  }

  async getPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 600, // La URL será válida por 10 minutos
    });

    return signedUrl;
  }


// FUncion para descargar o visualizar estudios
  async getPresignedDownloadUrl(
    key: string,
    originalFileName: string,
    disposition: 'inline' | 'attachment' = 'attachment', // Nuevo parámetro con valor por defecto
  ) {
    const commandParams: any = {
      Bucket: this.bucket,
      Key: key,
    };

    // Si queremos forzar la descarga, añadimos las cabeceras
    if (disposition === 'attachment') {
      commandParams.ResponseContentDisposition = `attachment; filename="${originalFileName}"`;
      commandParams.ResponseContentType = 'application/octet-stream';
    } else {
      // Si queremos visualizar, dejamos que el navegador decida el tipo de contenido
      // y le decimos que lo muestre "en línea".
      commandParams.ResponseContentDisposition = `inline; filename="${originalFileName}"`;
    }

    const command = new GetObjectCommand(commandParams);
    return getSignedUrl(this.s3, command, { expiresIn: 600 });
  }

}