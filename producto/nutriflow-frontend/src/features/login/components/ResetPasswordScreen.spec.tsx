import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResetPasswordScreen } from './ResetPasswordScreen';

const mockUpdatePassword = vi.hoisted(() => vi.fn());
const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseAuthStore = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../shared/store/useAuthStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({ navigate: vi.fn() }),
}));

vi.mock('./AuthLayout', () => ({
  AuthLayout: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
  authInputClass: '',
  authLabelClass: '',
  authButtonClass: '',
  authErrorClass: '',
}));

vi.mock('lucide-react', () => ({
  Lock: () => <span />,
  ArrowRight: () => <span />,
  Eye: () => <span data-testid="icon-eye" />,
  EyeOff: () => <span data-testid="icon-eye-off" />,
  Loader2: () => <span data-testid="icon-loader" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
}));

// useAuthStore is called twice per render with two selectors:
//   const isAuthLoading = useAuthStore((s) => s.isLoading);
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
// Mocking with a selector-dispatch pattern handles both.
beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ updatePassword: mockUpdatePassword });
  mockUseAuthStore.mockImplementation((selector: any) =>
    selector({ isLoading: false, isAuthenticated: true }),
  );
});

const submitValidForm = () => {
  fireEvent.change(screen.getByLabelText('Nueva Contraseña'), {
    target: { value: 'nuevaPass123' },
  });
  fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
    target: { value: 'nuevaPass123' },
  });
  fireEvent.submit(
    screen.getByRole('button', { name: /Guardar Contraseña/i }).closest('form')!,
  );
};

describe('ResetPasswordScreen', () => {
  describe('estado de carga del token', () => {
    it('muestra spinner cuando isAuthLoading=true', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isLoading: true, isAuthenticated: false }),
      );
      render(<ResetPasswordScreen />);
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });
  });

  describe('enlace inválido', () => {
    it('muestra "Enlace Inválido" cuando no está autenticado y no cargando', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isLoading: false, isAuthenticated: false }),
      );
      render(<ResetPasswordScreen />);
      expect(screen.getByText('Enlace Inválido')).toBeInTheDocument();
    });

    it('muestra el link para solicitar un nuevo enlace', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isLoading: false, isAuthenticated: false }),
      );
      render(<ResetPasswordScreen />);
      expect(
        screen.getByRole('link', { name: /Solicitar Nuevo Enlace/i }),
      ).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('formulario de nueva contraseña', () => {
    it('muestra el campo "Nueva Contraseña"', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Nueva Contraseña')).toBeInTheDocument();
    });

    it('muestra el campo "Confirmar Contraseña"', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    });

    it('muestra error si la contraseña tiene menos de 8 caracteres', () => {
      render(<ResetPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Nueva Contraseña'), {
        target: { value: 'corta' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Guardar Contraseña/i }).closest('form')!,
      );
      expect(
        screen.getByText('La contraseña debe tener al menos 8 caracteres.'),
      ).toBeInTheDocument();
    });

    it('muestra error si las contraseñas no coinciden', () => {
      render(<ResetPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Nueva Contraseña'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
        target: { value: 'diferentes456' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Guardar Contraseña/i }).closest('form')!,
      );
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    });

    it('llama a updatePassword con la nueva contraseña al enviar el formulario válido', () => {
      mockUpdatePassword.mockResolvedValue({ error: null });
      render(<ResetPasswordScreen />);
      submitValidForm();
      expect(mockUpdatePassword).toHaveBeenCalledWith('nuevaPass123');
    });

    it('muestra error si updatePassword devuelve error', async () => {
      mockUpdatePassword.mockResolvedValue({ error: 'Error al actualizar contraseña.' });
      render(<ResetPasswordScreen />);
      submitValidForm();
      await screen.findByText('Error al actualizar contraseña.');
    });
  });

  describe('pantalla de éxito', () => {
    it('muestra "Contraseña Actualizada" tras actualizar con éxito', async () => {
      mockUpdatePassword.mockResolvedValue({ error: null });
      render(<ResetPasswordScreen />);
      submitValidForm();
      await screen.findByText('Contraseña Actualizada');
      expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    });

    it('muestra botón "Ir al Panel" en la pantalla de éxito', async () => {
      mockUpdatePassword.mockResolvedValue({ error: null });
      render(<ResetPasswordScreen />);
      submitValidForm();
      await screen.findByText('Contraseña Actualizada');
      expect(screen.getByRole('button', { name: /Ir al Panel/i })).toBeInTheDocument();
    });
  });
});
