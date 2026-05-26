import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { GenerarMenuDto } from './dto/generar-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly httpService: HttpService) {}

  generarSugerencias(dto: GenerarMenuDto) {
    const url = 'http://127.0.0.1:8000/api/menus/generar-menu';
    return this.httpService.post(url, dto).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Error al generar menú desde backend-math:', error);
        throw new InternalServerErrorException('Error al generar el menú. Verifica el backend matemático.');
      }),
    );
  }
}
