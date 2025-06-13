import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // CORS configuration
  app.enableCors();
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NextCore ERP - CRM Service')
    .setDescription('API documentation for the CRM service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).send('OK');
  });
  
  await app.listen(process.env.PORT || 3001);
  console.log(`CRM service is running on: ${await app.getUrl()}`);
}

bootstrap();