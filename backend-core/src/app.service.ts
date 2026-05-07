import { Injectable } from '@nestjs/common';
//hola
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
