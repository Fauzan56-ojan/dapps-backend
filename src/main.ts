import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["http://localhost:3000"],  
      methods: ["GET", "POST"],
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Simple Storage dApp API')
    .setDescription(
      'The Simple Storage description<br/>' +
      'Fauzan Kholid (221011402763)'
    )
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('dokumentation', app, documentFactory);

  const port = process.env.PORT || 3001;
  await app.listen(port);

}

bootstrap();
