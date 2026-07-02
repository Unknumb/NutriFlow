import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MiPerfil } from './MiPerfil';

const mockMutate = vi.hoisted(() => vi.fn());
const mockUsePerfilNutricionista = vi.hoisted(() => vi.fn());
const mockUseUpdatePerfil = vi.hoisted(() => vi.fn());
const mockValidarAvatar = vi.hoisted(() => vi.fn(() => null));
const mockUseMfa = vi.hoisted(() => vi.fn());
const mockStartEnroll = vi.hoisted(() => vi.fn());
const mockUnenroll = vi.hoisted(() => vi.fn());

vi.mock('../hooks/usePerfil', () => ({
  usePerfilNutricionista: mockUsePerfilNutricionista,
  useUpdatePerfil: mockUseUpdatePerfil,
}));

vi.mock('../../../shared/hooks/useMfa', () => ({
  useMfa: mockUseMfa,
}));

vi.mock('../services/avatarPerfil', () => ({
  subirAvatar: vi.fn(),
  eliminarAvatar: vi.fn(),
  validarAvatar: mockValidarAvatar,
  TIPOS_AVATAR_PERMITIDOS: ['image/jpeg', 'image/png', 'image/webp'],
}));

vi.mock('../../../shared/ui/organisms/PageHeader', () => ({
  PageHeader: ({ title }: any) => <div data-testid="page-header">{title}</div>,
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="icon-loader" />,
  Save: () => <span data-testid="icon-save" />,
  UserCircle: () => <span />,
  BadgeCheck: () => <span />,
  Mail: () => <span />,
  Camera: () => <span />,
  Trash2: () => <span data-testid="icon-trash" />,
  Shield: () => <span />,
  ShieldCheck: () => <span />,
  ShieldOff: () => <span />,
  X: () => <span />,
  Maximize2: () => <span />,
}));

const MFA_DEFAULT = {
  verifiedFactor: null,
  isLoadingFactors: true,
  enrollData: null,
  isEnrolling: false,
  isVerifying: false,
  isUnenrolling: false,
  error: null,
  startEnroll: mockStartEnroll,
  verifyEnrollment: vi.fn(),
  cancelEnroll: vi.fn(),
  unenroll: mockUnenroll,
};

const PERFIL_BASE = {
  id: 'nut-1',
  nombre: 'Ana',
  apellido: 'García',
  email: 'ana@example.com',
  registro_profesional: 'RN-12345',
  avatar_url: null as string | null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUpdatePerfil.mockReturnValue({ mutate: mockMutate, isPending: false });
  mockUsePerfilNutricionista.mockReturnValue({ data: null, isLoading: false, error: null });
  mockUseMfa.mockReturnValue({ ...MFA_DEFAULT });
});

describe('MiPerfil', () => {
  describe('estados de carga y error', () => {
    it('muestra spinner cuando isLoading=true', () => {
      mockUsePerfilNutricionista.mockReturnValue({ data: null, isLoading: true, error: null });
      render(<MiPerfil />);
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });

    it('muestra el mensaje de error cuando hay un Error', () => {
      mockUsePerfilNutricionista.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Sin conexión'),
      });
      render(<MiPerfil />);
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });

    it('muestra el mensaje genérico cuando el error no es Error', () => {
      mockUsePerfilNutricionista.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'unknown',
      });
      render(<MiPerfil />);
      expect(screen.getByText('Error al cargar el perfil.')).toBeInTheDocument();
    });

    it('no renderiza el formulario cuando perfil=null', () => {
      render(<MiPerfil />);
      expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument();
    });
  });

  describe('formulario con perfil cargado', () => {
    beforeEach(() => {
      mockUsePerfilNutricionista.mockReturnValue({
        data: PERFIL_BASE,
        isLoading: false,
        error: null,
      });
    });

    it('rellena el input de nombre con el dato del perfil', () => {
      render(<MiPerfil />);
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    });

    it('rellena el input de apellido con el dato del perfil', () => {
      render(<MiPerfil />);
      expect(screen.getByDisplayValue('García')).toBeInTheDocument();
    });

    it('muestra el email del nutricionista (solo lectura)', () => {
      render(<MiPerfil />);
      expect(screen.getByDisplayValue('ana@example.com')).toBeInTheDocument();
    });

    it('rellena el registro profesional', () => {
      render(<MiPerfil />);
      expect(screen.getByDisplayValue('RN-12345')).toBeInTheDocument();
    });

    it('muestra las iniciales cuando no hay avatar_url (Ana García → AG)', () => {
      render(<MiPerfil />);
      expect(screen.getByText('AG')).toBeInTheDocument();
    });

    it('muestra la imagen cuando existe avatar_url', () => {
      mockUsePerfilNutricionista.mockReturnValue({
        data: { ...PERFIL_BASE, avatar_url: 'https://example.com/foto.jpg' },
        isLoading: false,
        error: null,
      });
      render(<MiPerfil />);
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/foto.jpg');
    });

    it('muestra el botón "Quitar" solo cuando existe avatar_url', () => {
      mockUsePerfilNutricionista.mockReturnValue({
        data: { ...PERFIL_BASE, avatar_url: 'https://example.com/foto.jpg' },
        isLoading: false,
        error: null,
      });
      render(<MiPerfil />);
      expect(screen.getByRole('button', { name: /Quitar/i })).toBeInTheDocument();
    });

    it('no muestra el botón "Quitar" cuando no hay avatar_url', () => {
      render(<MiPerfil />);
      expect(screen.queryByRole('button', { name: /Quitar/i })).not.toBeInTheDocument();
    });

    it('el botón "Guardar cambios" está habilitado con datos válidos', () => {
      render(<MiPerfil />);
      expect(screen.getByRole('button', { name: /Guardar cambios/i })).not.toBeDisabled();
    });

    it('isPending=true deshabilita el botón y muestra "Guardando..."', () => {
      mockUseUpdatePerfil.mockReturnValue({ mutate: mockMutate, isPending: true });
      render(<MiPerfil />);
      expect(screen.getByRole('button', { name: /Guardando/i })).toBeDisabled();
    });
  });

  describe('handleSubmit — validación', () => {
    beforeEach(() => {
      mockUsePerfilNutricionista.mockReturnValue({
        data: PERFIL_BASE,
        isLoading: false,
        error: null,
      });
    });

    it('muestra error si el nombre está vacío al guardar', () => {
      render(<MiPerfil />);
      fireEvent.change(screen.getByDisplayValue('Ana'), { target: { value: '' } });
      // fireEvent.submit bypasses native HTML5 required-field validation
      const form = screen.getByRole('button', { name: /Guardar cambios/i }).closest('form')!;
      fireEvent.submit(form);
      expect(screen.getByText('El nombre y el apellido son obligatorios.')).toBeInTheDocument();
    });

    it('muestra error si el apellido está vacío al guardar', () => {
      render(<MiPerfil />);
      fireEvent.change(screen.getByDisplayValue('García'), { target: { value: '' } });
      const form = screen.getByRole('button', { name: /Guardar cambios/i }).closest('form')!;
      fireEvent.submit(form);
      expect(screen.getByText('El nombre y el apellido son obligatorios.')).toBeInTheDocument();
    });

    it('llama a updatePerfil.mutate con nombre y apellido correctos', () => {
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Ana', apellido: 'García' }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    it('muestra feedback de éxito tras onSuccess del mutate', () => {
      mockMutate.mockImplementation((_data: any, { onSuccess }: any) => onSuccess());
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
      expect(screen.getByText('Perfil actualizado correctamente.')).toBeInTheDocument();
    });

    it('muestra feedback de error tras onError del mutate', () => {
      mockMutate.mockImplementation((_data: any, { onError }: any) =>
        onError(new Error('Fallo al guardar')),
      );
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
      expect(screen.getByText('Fallo al guardar')).toBeInTheDocument();
    });
  });

  describe('MFA — ver QR más grande', () => {
    beforeEach(() => {
      mockUsePerfilNutricionista.mockReturnValue({ data: PERFIL_BASE, isLoading: false, error: null });
      mockUseMfa.mockReturnValue({
        ...MFA_DEFAULT,
        isLoadingFactors: false,
        enrollData: { factorId: 'f-1', qrCode: 'data:image/png;base64,QR', secret: 'ABCD1234' },
      });
    });

    it('no muestra el QR ampliado hasta pulsar "Ver más grande"', () => {
      render(<MiPerfil />);
      expect(
        screen.queryByAltText('Código QR ampliado para autenticación en dos pasos'),
      ).not.toBeInTheDocument();
    });

    it('al pulsar "Ver más grande" muestra el QR ampliado', () => {
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Ver más grande/i }));
      expect(
        screen.getByAltText('Código QR ampliado para autenticación en dos pasos'),
      ).toBeInTheDocument();
    });
  });

  describe('MFA — confirmación al desactivar el doble factor', () => {
    beforeEach(() => {
      mockUsePerfilNutricionista.mockReturnValue({ data: PERFIL_BASE, isLoading: false, error: null });
      mockUseMfa.mockReturnValue({
        ...MFA_DEFAULT,
        isLoadingFactors: false,
        verifiedFactor: { id: 'f-1', status: 'verified' },
      });
    });

    it('pulsar "Desactivar" NO desactiva de inmediato: pide confirmación', () => {
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Desactivar verificación en dos pasos/i }));
      expect(screen.getByText('¿Desactivar la verificación en dos pasos?')).toBeInTheDocument();
      expect(mockUnenroll).not.toHaveBeenCalled();
    });

    it('sólo tras confirmar "Sí, desactivar" se llama a unenroll con el factor', () => {
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Desactivar verificación en dos pasos/i }));
      fireEvent.click(screen.getByRole('button', { name: /Sí, desactivar/i }));
      expect(mockUnenroll).toHaveBeenCalledWith('f-1');
    });

    it('cancelar cierra la confirmación sin desactivar', () => {
      render(<MiPerfil />);
      fireEvent.click(screen.getByRole('button', { name: /Desactivar verificación en dos pasos/i }));
      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(screen.queryByText('¿Desactivar la verificación en dos pasos?')).not.toBeInTheDocument();
      expect(mockUnenroll).not.toHaveBeenCalled();
    });
  });
});
