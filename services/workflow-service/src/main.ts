import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NextCore ERP - Workflow Service')
    .setDescription('Workflow Engine API for NextCore ERP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'workflow-service',
      timestamp: new Date().toISOString(),
    });
  });

  const port = process.env.PORT || 3007;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Workflow Service running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔍 Health Check: http://localhost:${port}/health`);
}

bootstrap();