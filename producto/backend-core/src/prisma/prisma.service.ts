import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Se guarda la referencia al pool porque el adaptador no es dueño de un pool
  // creado externamente: somos responsables de cerrarlo al destruir el módulo.
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    // Cierra la conexión de Prisma y el pool de pg, así no quedan handles
    // abiertos al apagar la app (p. ej. al finalizar las pruebas e2e).
    await this.$disconnect();
    await this.pool.end();
  }
}
