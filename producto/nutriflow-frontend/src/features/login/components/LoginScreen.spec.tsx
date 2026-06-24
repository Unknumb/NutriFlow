import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginScreen } from './LoginScreen';

const mockLogin = vi.hoisted(() => vi.fn());
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
  authLinkClass: '',
}));

vi.mock('lucide-react', () => ({
  Mail: () => <span />,
  Lock: () => <span />,
  ArrowRight: () => <span />,
  Eye: () => <span data-testid="icon-eye" />,
  EyeOff: () => <span data-testid="icon-eye-off" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ login: mockLogin, isLoggingIn: false, loginError: null });
  mockUseAuthStore.mockReturnValue(false);
});

describe('LoginScreen', () => {
  describe('campos del formulario', () => {
    it('muestra el campo de correo electrónico', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    });

    it('muestra el campo de contraseña', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    });

    it('la contraseña está oculta por defecto (type="password")', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    });

    it('al clic en el botón de ojo muestra la contraseña (type="text")', () => {
      render(<LoginScreen />);
      fireEvent.click(screen.getByRole('button', { name: /Mostrar contraseña/i }));
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text');
    });

    it('un segundo clic vuelve a ocultar la contraseña', () => {
      render(<LoginScreen />);
      fireEvent.click(screen.getByRole('button', { name: /Mostrar contraseña/i }));
      fireEvent.click(screen.getByRole('button', { name: /Ocultar contraseña/i }));
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    });
  });

  describe('botón de submit', () => {
    it('muestra "Ingresar" cuando no está cargando', () => {
      render(<LoginScreen />);
      expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
    });

    it('está deshabilitado y muestra "Ingresando..." cuando isLoggingIn=true', () => {
      mockUseAuth.mockReturnValue({ login: mockLogin, isLoggingIn: true, loginError: null });
      render(<LoginScreen />);
      expect(screen.getByRole('button', { name: /Ingresando/i })).toBeDisabled();
    });
  });

  describe('error de login', () => {
    it('muestra el mensaje de error cuando loginError tiene valor', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoggingIn: false,
        loginError: 'Credenciales inválidas.',
      });
      render(<LoginScreen />);
      expect(screen.getByText('Credenciales inválidas.')).toBeInTheDocument();
    });
  });

  describe('submit del formulario', () => {
    it('llama a login con email y contraseña al enviar el formulario', () => {
      render(<LoginScreen />);
      fireEvent.change(screen.getByLabelText('Correo electrónico'), {
        target: { value: 'usuario@test.com' },
      });
      fireEvent.change(screen.getByLabelText('Contraseña'), {
        target: { value: 'password123' },
      });
      fireEvent.submit(screen.getByRole('button', { name: /Ingresar/i }).closest('form')!);
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'usuario@test.com',
        password: 'password123',
      });
    });
  });

  describe('navegación', () => {
    it('muestra el link para crear cuenta', () => {
      render(<LoginScreen />);
      expect(screen.getByRole('link', { name: /Crear cuenta/i })).toHaveAttribute(
        'href',
        '/register',
      );
    });

    it('muestra el link de recuperación de contraseña', () => {
      render(<LoginScreen />);
      expect(
        screen.getByRole('link', { name: /Olvidaste tu contraseña/i }),
      ).toHaveAttribute('href', '/forgot-password');
    });
  });
});
