import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS y validación global.
  // En producción se restringe a los orígenes de FRONTEND_URL (separados por coma);
  // si la variable no está definida, se reflejan todos los orígenes (útil en desarrollo).
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',').map((o) => o.trim()) ?? true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('NutriFlow Core API')
    .setDescription('API principal para la gestión de pacientes y orquestación.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

