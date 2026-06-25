import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegisterScreen } from './RegisterScreen';

const mockSignUp = vi.hoisted(() => vi.fn());
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
  MailCheck: () => <span data-testid="icon-mailcheck" />,
  User: () => <span />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ signUp: mockSignUp });
  mockUseAuthStore.mockReturnValue(false);
});

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Javiera' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
    target: { value: 'javiera@test.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
  fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
    target: { value: 'password123' },
  });
};

describe('RegisterScreen', () => {
  describe('campos del formulario', () => {
    it('muestra el campo Nombre', () => {
      render(<RegisterScreen />);
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    });

    it('muestra el campo Apellido', () => {
      render(<RegisterScreen />);
      expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
    });

    it('muestra el campo Correo Electrónico', () => {
      render(<RegisterScreen />);
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    });

    it('muestra el campo Contraseña', () => {
      render(<RegisterScreen />);
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    });

    it('muestra el campo Confirmar Contraseña', () => {
      render(<RegisterScreen />);
      expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    });

    it('muestra el botón "Crear Cuenta"', () => {
      render(<RegisterScreen />);
      expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeInTheDocument();
    });
  });

  describe('validación del formulario', () => {
    it('muestra error si el nombre está vacío al enviar', () => {
      render(<RegisterScreen />);
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      expect(
        screen.getByText('El nombre y el apellido son obligatorios.'),
      ).toBeInTheDocument();
    });

    it('muestra error si la contraseña tiene menos de 8 caracteres', () => {
      render(<RegisterScreen />);
      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Javiera' } });
      fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'corta' } });
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      expect(
        screen.getByText('La contraseña debe tener al menos 8 caracteres.'),
      ).toBeInTheDocument();
    });

    it('muestra error si las contraseñas no coinciden', () => {
      render(<RegisterScreen />);
      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Javiera' } });
      fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
        target: { value: 'password456' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    });
  });

  describe('submit exitoso', () => {
    it('llama a signUp con los datos del formulario', () => {
      mockSignUp.mockResolvedValue({ error: null, needsEmailConfirmation: false });
      render(<RegisterScreen />);
      fillValidForm();
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Javiera',
          apellido: 'Pérez',
          email: 'javiera@test.com',
        }),
      );
    });

    it('muestra la pantalla de confirmación cuando needsEmailConfirmation=true', async () => {
      mockSignUp.mockResolvedValue({ error: null, needsEmailConfirmation: true });
      render(<RegisterScreen />);
      fillValidForm();
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      await screen.findByText('Revisa tu correo');
      expect(screen.getByTestId('icon-mailcheck')).toBeInTheDocument();
    });

    it('muestra el email del usuario en la pantalla de confirmación', async () => {
      mockSignUp.mockResolvedValue({ error: null, needsEmailConfirmation: true });
      render(<RegisterScreen />);
      fillValidForm();
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      await screen.findByText('Revisa tu correo');
      expect(screen.getByText('javiera@test.com')).toBeInTheDocument();
    });

    it('muestra error si signUp devuelve error', async () => {
      mockSignUp.mockResolvedValue({
        error: 'Este correo ya está registrado.',
        needsEmailConfirmation: false,
      });
      render(<RegisterScreen />);
      fillValidForm();
      fireEvent.submit(
        screen.getByRole('button', { name: /Crear Cuenta/i }).closest('form')!,
      );
      await screen.findByText('Este correo ya está registrado.');
    });
  });

  describe('navegación', () => {
    it('muestra link para iniciar sesión', () => {
      render(<RegisterScreen />);
      expect(
        screen.getByRole('link', { name: /Iniciar Sesión/i }),
      ).toHaveAttribute('href', '/login');
    });
  });
});
