import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS y validación global.
  // Orígenes permitidos explícitos (FRONTEND_URL, separados por coma); se les
  // quita la barra final para evitar fallos por "https://sitio/" vs "https://sitio".
  const origenesPermitidos = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  // Todos los despliegues del proyecto en Vercel (producción y previews) usan un
  // host del tipo "nutri-flow-<algo>.vercel.app". Como las URLs de preview cambian
  // en cada deploy, se permiten por patrón en lugar de listarlas una por una.
  const VERCEL_NUTRIFLOW = /^nutri-flow[a-z0-9-]*\.vercel\.app$/i;

  app.enableCors({
    origin: (origin, callback) => {
      // Sin Origin: herramientas/servidor a servidor (curl, health checks). Permitir.
      if (!origin) return callback(null, true);

      const limpio = origin.replace(/\/+$/, '');
      let permitido = origenesPermitidos.includes(limpio);

      if (!permitido) {
        try {
          permitido = VERCEL_NUTRIFLOW.test(new URL(limpio).hostname);
        } catch {
          permitido = false; // Origin malformado
        }
      }

      // Sin lanzar error: si no está permitido simplemente no se envía el header
      // Access-Control-Allow-Origin y el navegador bloquea la petición.
      return callback(null, permitido);
    },
    allowedHeaders: ['Authorization', 'Accept', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
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

