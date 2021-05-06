import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

// To avoid exceptions on bad response statuses
import axios from 'axios';
axios.defaults.validateStatus = () => true;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerDocumentBuilder = new DocumentBuilder()
    .setTitle('Wyre Integration Service')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerDocumentBuilder,
  );
  SwaggerModule.setup('swagger', app, swaggerDocument);

  await app.listen(3000);
}

bootstrap();
