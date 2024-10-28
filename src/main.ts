import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:8082', // Allow your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow specific HTTP methods
    credentials: true, // Allow credentials (optional)
  });
  app.setGlobalPrefix('api/v1');
  await app.listen(3333);
}
bootstrap();
