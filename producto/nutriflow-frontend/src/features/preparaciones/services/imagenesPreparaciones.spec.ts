import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validarImagenPreparacion,
  eliminarImagenPreparacion,
  TAMANO_MAXIMO_IMAGEN,
  TIPOS_IMAGEN_PERMITIDOS,
} from './imagenesPreparaciones';

const mockRemove = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
const mockStorageFrom = vi.hoisted(() => vi.fn(() => ({ remove: mockRemove })));

vi.mock('../../../shared/utils/supabase', () => ({
  supabase: {
    storage: { from: mockStorageFrom },
  },
}));

const makeFile = (type: string, sizeBytes: number): File =>
  new File([new Uint8Array(sizeBytes)], 'imagen.jpg', { type });

const URL_VALIDA = (userId: string, filename = 'imagen.jpg') =>
  `https://project.supabase.co/storage/v1/object/public/imagenes_preparaciones/${userId}/${filename}`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('validarImagenPreparacion', () => {
  it('devuelve null para imagen JPEG dentro del límite', () => {
    expect(validarImagenPreparacion(makeFile('image/jpeg', 1024))).toBeNull();
  });

  it('devuelve null para imagen PNG dentro del límite', () => {
    expect(validarImagenPreparacion(makeFile('image/png', 500_000))).toBeNull();
  });

  it('devuelve null para imagen WebP dentro del límite', () => {
    expect(validarImagenPreparacion(makeFile('image/webp', 1_000_000))).toBeNull();
  });

  it('devuelve error cuando el tipo no está permitido (GIF)', () => {
    const error = validarImagenPreparacion(makeFile('image/gif', 1024));
    expect(error).toContain('JPG, PNG o WebP');
  });

  it('devuelve error para tipo application/pdf', () => {
    const error = validarImagenPreparacion(makeFile('application/pdf', 1024));
    expect(error).not.toBeNull();
  });

  it('devuelve error cuando el archivo supera el límite de 2 MB', () => {
    const error = validarImagenPreparacion(makeFile('image/jpeg', TAMANO_MAXIMO_IMAGEN + 1));
    expect(error).toContain('2 MB');
  });

  it('devuelve null cuando el archivo tiene exactamente el tamaño máximo permitido', () => {
    expect(validarImagenPreparacion(makeFile('image/jpeg', TAMANO_MAXIMO_IMAGEN))).toBeNull();
  });

  it('cubre todos los tipos declarados en TIPOS_IMAGEN_PERMITIDOS', () => {
    for (const tipo of TIPOS_IMAGEN_PERMITIDOS) {
      expect(validarImagenPreparacion(makeFile(tipo, 1024))).toBeNull();
    }
  });
});

describe('eliminarImagenPreparacion', () => {
  it('llama a remove con el path correcto cuando la URL pertenece al bucket y al usuario', async () => {
    await eliminarImagenPreparacion(URL_VALIDA('user-1'), 'user-1');
    expect(mockStorageFrom).toHaveBeenCalledWith('imagenes_preparaciones');
    expect(mockRemove).toHaveBeenCalledWith(['user-1/imagen.jpg']);
  });

  it('NO llama a remove cuando la URL no pertenece al bucket de imágenes', async () => {
    await eliminarImagenPreparacion('https://otro-dominio.com/imagen.jpg', 'user-1');
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('NO llama a remove cuando la URL pertenece a otro usuario', async () => {
    await eliminarImagenPreparacion(URL_VALIDA('user-otro'), 'user-1');
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('NO llama a remove para string vacío', async () => {
    await eliminarImagenPreparacion('', 'user-1');
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('limpia query params de la URL antes de extraer el path', async () => {
    const urlConParams = URL_VALIDA('user-1', 'imagen.jpg') + '?t=1234567890';
    await eliminarImagenPreparacion(urlConParams, 'user-1');
    expect(mockRemove).toHaveBeenCalledWith(['user-1/imagen.jpg']);
  });

  it('decodifica caracteres codificados en la URL del path', async () => {
    const urlCodificada = URL_VALIDA('user-1', 'ensalada%20verde.jpg');
    await eliminarImagenPreparacion(urlCodificada, 'user-1');
    expect(mockRemove).toHaveBeenCalledWith(['user-1/ensalada verde.jpg']);
  });

  it('no lanza aunque remove falle (best-effort)', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Storage error'));
    await expect(
      eliminarImagenPreparacion(URL_VALIDA('user-1'), 'user-1'),
    ).resolves.toBeUndefined();
  });
});
