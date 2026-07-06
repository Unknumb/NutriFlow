import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones (OWASP A10 — Mishandling of Exceptional Conditions).
 *
 * Objetivo: que ninguna excepción no controlada exponga detalles internos
 * (stack traces, mensajes de la DB) al cliente. Las excepciones HTTP de negocio
 * (NotFoundException, etc.) se preservan; los errores conocidos de Prisma se
 * traducen a códigos apropiados con mensaje genérico; cualquier otro error se
 * responde como 500 genérico y su detalle real se loguea solo en el servidor.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1) Excepciones HTTP de negocio: se respetan tal cual (ya son seguras).
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    // 2) Errores conocidos de Prisma: traducir a un status adecuado sin filtrar
    //    el mensaje interno de la base de datos.
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, message } = this.mapPrismaError(exception.code);
      this.logger.warn(
        `Prisma ${exception.code} en ${request.method} ${request.url}: ${exception.message}`,
      );
      return response.status(status).json({ statusCode: status, message });
    }

    // 3) Cualquier otro error: 500 genérico al cliente, detalle solo en logs.
    this.logger.error(
      `Excepción no controlada en ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Se ha producido un error inesperado en el servidor.',
    });
  }

  private mapPrismaError(code: string): { status: number; message: string } {
    switch (code) {
      case 'P2025': // Registro no encontrado
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Recurso no encontrado.',
        };
      case 'P2002': // Violación de restricción única
        return {
          status: HttpStatus.CONFLICT,
          message: 'El recurso ya existe o viola una restricción de unicidad.',
        };
      case 'P2003': // Violación de clave foránea
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            'Referencia inválida: uno o más datos relacionados no existen.',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Se ha producido un error al procesar la solicitud.',
        };
    }
  }
}
