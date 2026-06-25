import { describe, it, expect } from 'vitest';
import { traducirPorcionesParaMath, GRUPO_A_MATH } from './gruposMath';

describe('traducirPorcionesParaMath', () => {
  it('traduce IDs cortos a sus claves largas de backend-math', () => {
    // Arrange
    const porciones = { cer: 3, veg: 2, fru: 1, ace: 4 };

    // Act
    const resultado = traducirPorcionesParaMath(porciones);

    // Assert
    expect(resultado).toEqual({
      cereales_papas_legumbres_frescas: 3,
      verduras_general: 2,
      frutas: 1,
      aceites_y_grasas: 4,
    });
  });

  it('omite entradas con cantidad igual a 0 o negativa', () => {
    // Arrange
    const porciones = { cer: 2, veg: 0, fru: -1, lag: 3 };

    // Act
    const resultado = traducirPorcionesParaMath(porciones);

    // Assert
    expect(resultado).toEqual({
      cereales_papas_legumbres_frescas: 2,
      lacteos_altos_grasa: 3,
    });
    expect(resultado).not.toHaveProperty('verduras_general');
    expect(resultado).not.toHaveProperty('frutas');
  });

  it('ignora silenciosamente IDs que no existen en el mapeo sin lanzar errores', () => {
    // Arrange
    const porciones = { cer: 2, grupo_inexistente: 5, OTRO_ID_FALSO: 10 };

    // Act — no debe lanzar
    expect(() => traducirPorcionesParaMath(porciones)).not.toThrow();
    const resultado = traducirPorcionesParaMath(porciones);

    // Assert — solo pasa la clave conocida; las desconocidas no aparecen
    expect(resultado).toEqual({ cereales_papas_legumbres_frescas: 2 });
    expect(resultado).not.toHaveProperty('grupo_inexistente');
    expect(resultado).not.toHaveProperty('OTRO_ID_FALSO');
  });

  it('acumula cantidades cuando dos claves cortas distintas mapean a la misma clave larga', () => {
    // Arrange: añadimos temporalmente un alias que colisiona con 'cer'
    GRUPO_A_MATH['cer_alias'] = 'cereales_papas_legumbres_frescas';
    const porciones = { cer: 3, cer_alias: 2 };

    // Act
    const resultado = traducirPorcionesParaMath(porciones);

    // Assert
    expect(resultado).toEqual({ cereales_papas_legumbres_frescas: 5 });

    // Cleanup: restaurar el mapeo original
    delete GRUPO_A_MATH['cer_alias'];
  });
});
