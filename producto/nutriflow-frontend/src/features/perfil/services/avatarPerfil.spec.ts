import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validarAvatar,
  eliminarAvatar,
  TAMANO_MAXIMO_AVATAR,
  TIPOS_AVATAR_PERMITIDOS,
} from './avatarPerfil';

const mockRemove = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
const mockStorageFrom = vi.hoisted(() => vi.fn(() => ({ remove: mockRemove })));

vi.mock('../../../shared/utils/supabase', () => ({
  supabase: {
    storage: { from: mockStorageFrom },
  },
}));

const makeFile = (type: string, sizeBytes: number): File =>
  new File([new Uint8Array(sizeBytes)], 'foto.jpg', { type });

const URL_VALIDA = (userId: string, filename = 'foto.jpg') =>
  `https://project.supabase.co/storage/v1/object/public/avatares_perfil/${userId}/${filename}`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('validarAvatar', () => {
  it('devuelve null para imagen JPEG dentro del límite', () => {
    expect(validarAvatar(makeFile('image/jpeg', 1024))).toBeNull();
  });

  it('devuelve null para imagen PNG dentro del límite', () => {
    expect(validarAvatar(makeFile('image/png', 500_000))).toBeNull();
  });

  it('devuelve null para imagen WebP dentro del límite', () => {
    expect(validarAvatar(makeFile('image/webp', 1_000_000))).toBeNull();
  });

  it('devuelve error cuando el tipo no está permitido', () => {
    const error = validarAvatar(makeFile('image/gif', 1024));
    expect(error).toContain('JPG, PNG o WebP');
  });

  it('devuelve error para tipo application/pdf', () => {
    const error = validarAvatar(makeFile('application/pdf', 1024));
    expect(error).not.toBeNull();
  });

  it('devuelve error cuando el archivo supera el límite de 2 MB', () => {
    const error = validarAvatar(makeFile('image/jpeg', TAMANO_MAXIMO_AVATAR + 1));
    expect(error).toContain('2 MB');
  });

  it('devuelve null cuando el archivo tiene exactamente el tamaño máximo permitido', () => {
    expect(validarAvatar(makeFile('image/jpeg', TAMANO_MAXIMO_AVATAR))).toBeNull();
  });

  it('cubre todos los tipos declarados en TIPOS_AVATAR_PERMITIDOS', () => {
    for (const tipo of TIPOS_AVATAR_PERMITIDOS) {
      expect(validarAvatar(makeFile(tipo, 1024))).toBeNull();
    }
  });
});

describe('eliminarAvatar', () => {
  it('llama a remove con el path correcto cuando la URL es válida y del usuario', async () => {
    await eliminarAvatar(URL_VALIDA('user-1'), 'user-1');
    expect(mockStorageFrom).toHaveBeenCalledWith('avatares_perfil');
    expect(mockRemove).toHaveBeenCalledWith(['user-1/foto.jpg']);
  });

  it('NO llama a remove cuando la URL no pertenece al bucket de avatares', async () => {
    await eliminarAvatar('https://otro-dominio.com/imagen.jpg', 'user-1');
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('NO llama a remove cuando la URL pertenece a otro usuario', async () => {
    await eliminarAvatar(URL_VALIDA('user-otro'), 'user-1');
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('NO llama a remove para string vacío', async () => {
    await eliminarAvatar('', 'user-1');
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('limpia query params de la URL antes de extraer el path', async () => {
    const urlConParams = URL_VALIDA('user-1', 'foto.jpg') + '?t=1234567890';
    await eliminarAvatar(urlConParams, 'user-1');
    expect(mockRemove).toHaveBeenCalledWith(['user-1/foto.jpg']);
  });

  it('decodifica caracteres codificados en la URL del path', async () => {
    const urlCodificada = URL_VALIDA('user-1', 'foto%20perfil.jpg');
    await eliminarAvatar(urlCodificada, 'user-1');
    expect(mockRemove).toHaveBeenCalledWith(['user-1/foto perfil.jpg']);
  });

  it('no lanza aunque remove falle (best-effort)', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Storage error'));
    await expect(eliminarAvatar(URL_VALIDA('user-1'), 'user-1')).resolves.toBeUndefined();
  });
});
