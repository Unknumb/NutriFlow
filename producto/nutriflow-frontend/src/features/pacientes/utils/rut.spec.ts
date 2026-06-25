import { describe, it, expect } from 'vitest';
import {
  calcularDigitoVerificador,
  esRutValido,
  formatearRutInput,
  normalizarRut,
} from './rut';

// ─── calcularDigitoVerificador ────────────────────────────────────────────────

describe('calcularDigitoVerificador', () => {
  it('calcula el DV estándar para un cuerpo de 8 dígitos (módulo 11 general)', () => {
    // Arrange — suma=138, 138%11=6, resto=11-6=5
    const cuerpo = '12345678';

    // Act
    const resultado = calcularDigitoVerificador(cuerpo);

    // Assert
    expect(resultado).toBe('5');
  });

  it("retorna 'K' cuando el resto del módulo 11 es 10 (11 - 1 = 10)", () => {
    // Arrange — suma=177, 177%11=1, resto=11-1=10 → 'K'
    const cuerpo = '7775735';

    // Act
    const resultado = calcularDigitoVerificador(cuerpo);

    // Assert
    expect(resultado).toBe('K');
  });

  it("retorna '0' cuando la suma es divisible entre 11 (resto=11 en el código)", () => {
    // Arrange — suma = 6*7 + 1*2 = 42+2 = 44, 44%11=0, 11-0=11 → '0'
    const cuerpo = '1600000';

    // Act
    const resultado = calcularDigitoVerificador(cuerpo);

    // Assert
    expect(resultado).toBe('0');
  });

  it('cicla el multiplicador de 7 de vuelta a 2 correctamente en cuerpos de 8 dígitos', () => {
    // Arrange — 11.111.111-1: suma=32, 32%11=10, DV=11-10=1
    // El multiplicador en posición i=1 llega a 7 y en i=0 debe reiniciar a 2
    const cuerpo = '11111111';

    // Act
    const resultado = calcularDigitoVerificador(cuerpo);

    // Assert
    expect(resultado).toBe('1');
  });
});

// ─── esRutValido ──────────────────────────────────────────────────────────────

describe('esRutValido', () => {
  describe('casos inválidos', () => {
    it('rechaza string vacío', () => {
      // Arrange / Act / Assert
      expect(esRutValido('')).toBe(false);
    });

    it('rechaza valores de tipo number (no son string)', () => {
      expect(esRutValido(12345678)).toBe(false);
    });

    it('rechaza null y undefined', () => {
      expect(esRutValido(null)).toBe(false);
      expect(esRutValido(undefined)).toBe(false);
    });

    it('rechaza un RUT con cuerpo de solo 6 dígitos (por debajo del mínimo de 7)', () => {
      // Arrange — limpio='1234567' (7 chars); regex exige 8-9 → falla
      const rut = '123456-7';

      // Act / Assert
      expect(esRutValido(rut)).toBe(false);
    });

    it('rechaza un RUT con letras intercaladas en el cuerpo (no dígitos, no K final)', () => {
      // Arrange — limpio='12A456785'; la 'A' hace fallar /^\d{7,8}[\dK]$/
      const rut = '12A45678-5';

      // Act / Assert
      expect(esRutValido(rut)).toBe(false);
    });

    it('rechaza un RUT con dígito verificador matemáticamente incorrecto', () => {
      // Arrange — DV correcto para '12345678' es '5', no '1'
      const rut = '12345678-1';

      // Act / Assert
      expect(esRutValido(rut)).toBe(false);
    });

    it("rechaza un RUT donde se esperaba 'K' pero se entregó un dígito", () => {
      // Arrange — DV correcto para '7775735' es 'K', no '5'
      const rut = '7775735-5';

      // Act / Assert
      expect(esRutValido(rut)).toBe(false);
    });
  });

  describe('casos válidos', () => {
    it('acepta un RUT con formato estándar (con puntos y guión)', () => {
      expect(esRutValido('12.345.678-5')).toBe(true);
    });

    it('acepta un RUT sin puntos ni guión (dígitos continuos)', () => {
      expect(esRutValido('123456785')).toBe(true);
    });

    it('acepta un RUT cuyo DV es K mayúscula', () => {
      expect(esRutValido('7.775.735-K')).toBe(true);
    });

    it('acepta un RUT cuyo DV es k minúscula (limpiarRut lo normaliza a mayúscula)', () => {
      expect(esRutValido('7775735-k')).toBe(true);
    });

    it('acepta un RUT con cuerpo de 7 dígitos (límite mínimo válido)', () => {
      // Arrange — suma=106, 106%11=7, DV=11-7=4
      expect(esRutValido('1234567-4')).toBe(true);
    });

    it('acepta un RUT con espacios entre grupos de dígitos (limpiarRut los elimina)', () => {
      expect(esRutValido('12 345 678-5')).toBe(true);
    });
  });
});

// ─── normalizarRut ────────────────────────────────────────────────────────────

describe('normalizarRut', () => {
  it('elimina puntos y produce el formato canónico "cuerpo-DV"', () => {
    // Arrange
    const rut = '12.345.678-5';

    // Act
    const resultado = normalizarRut(rut);

    // Assert
    expect(resultado).toBe('12345678-5');
  });

  it('mantiene sin cambios un RUT que ya está en formato canónico', () => {
    expect(normalizarRut('12345678-5')).toBe('12345678-5');
  });

  it('preserva la K mayúscula como DV en el formato canónico', () => {
    expect(normalizarRut('7.775.735-K')).toBe('7775735-K');
  });

  it('normaliza k minúscula a K mayúscula via limpiarRut → toUpperCase', () => {
    expect(normalizarRut('7775735-k')).toBe('7775735-K');
  });

  it('elimina espacios adicionales y reformatea correctamente', () => {
    // Arrange — limpiarRut quita puntos, guiones y espacios
    const rut = '12 345 678 - 5';

    // Act
    const resultado = normalizarRut(rut);

    // Assert
    expect(resultado).toBe('12345678-5');
  });
});

// ─── formatearRutInput ────────────────────────────────────────────────────────

describe('formatearRutInput', () => {
  it('retorna string vacío cuando el input está vacío', () => {
    expect(formatearRutInput('')).toBe('');
  });

  it('retorna el único carácter sin puntuación cuando solo hay un dígito', () => {
    expect(formatearRutInput('5')).toBe('5');
  });

  it("normaliza 'k' minúscula a 'K' cuando es el único carácter", () => {
    expect(formatearRutInput('k')).toBe('K');
  });

  it('descarta letras no válidas (distintas de k/K) y retorna vacío si no quedan chars', () => {
    // Arrange — 'abc' → limpio='' → retorna ''
    expect(formatearRutInput('abc')).toBe('');
  });

  it('descarta letras no válidas mezcladas con dígitos y formatea lo que queda', () => {
    // Arrange — '1a2b3' → limpio='123' → cuerpo='12', dv='3'
    // Act / Assert
    expect(formatearRutInput('1a2b3')).toBe('12-3');
  });

  it('agrega puntos y guión para un cuerpo de 7 dígitos (8 chars de entrada)', () => {
    // Arrange — '12345674' → cuerpo='1234567', dv='4' → '1.234.567-4'
    expect(formatearRutInput('12345674')).toBe('1.234.567-4');
  });

  it('agrega puntos y guión para un cuerpo de 8 dígitos (9 chars de entrada)', () => {
    // Arrange — '123456789' → cuerpo='12345678', dv='9' → '12.345.678-9'
    expect(formatearRutInput('123456789')).toBe('12.345.678-9');
  });

  it("formatea correctamente cuando el DV es 'K' mayúscula", () => {
    // Arrange — '1234567K' → cuerpo='1234567', dv='K'
    expect(formatearRutInput('1234567K')).toBe('1.234.567-K');
  });

  it("normaliza DV 'k' minúscula a 'K' en el resultado formateado", () => {
    expect(formatearRutInput('1234567k')).toBe('1.234.567-K');
  });

  it('limita el input a 9 caracteres útiles (cuerpo 8 + DV) descartando el exceso', () => {
    // Arrange — '1234567890' (10 chars) → slice(0,9)='123456789' → cuerpo='12345678', dv='9'
    expect(formatearRutInput('1234567890')).toBe('12.345.678-9');
  });

  it("elimina 'K' intercalada en el cuerpo (solo válida como último carácter)", () => {
    // Arrange — '12K45678' → limpio='12K45678' → cuerpo='12K4567'.replace(/K/g,'')='124567', dv='8'
    // '124567' con puntos: posición 3 → '124.567'
    expect(formatearRutInput('12K45678')).toBe('124.567-8');
  });
});
