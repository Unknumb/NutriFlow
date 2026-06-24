import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

const mockRequestPasswordReset = vi.hoisted(() => vi.fn());
const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('./AuthLayout', () => ({
  AuthLayout: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
  authInputClass: '',
  authButtonClass: '',
  authErrorClass: '',
  authLinkClass: '',
}));

vi.mock('lucide-react', () => ({
  Mail: () => <span />,
  ArrowRight: () => <span />,
  Loader2: () => <span data-testid="icon-loader" />,
  MailCheck: () => <span data-testid="icon-mailcheck" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ requestPasswordReset: mockRequestPasswordReset });
});

describe('ForgotPasswordScreen', () => {
  describe('formulario', () => {
    it('muestra el campo de correo electrónico', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    });

    it('muestra el botón "Enviar Enlace"', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByRole('button', { name: /Enviar Enlace/i })).toBeInTheDocument();
    });

    it('muestra el link para volver a iniciar sesión', () => {
      render(<ForgotPasswordScreen />);
      expect(
        screen.getByRole('link', { name: /Iniciar Sesión/i }),
      ).toHaveAttribute('href', '/login');
    });

    it('llama a requestPasswordReset con el email al enviar', () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null });
      render(<ForgotPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { value: 'usuario@test.com' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Enviar Enlace/i }).closest('form')!,
      );
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('usuario@test.com');
    });
  });

  describe('pantalla de confirmación', () => {
    it('muestra "Revisa tu correo" tras envío exitoso', async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null });
      render(<ForgotPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { value: 'usuario@test.com' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Enviar Enlace/i }).closest('form')!,
      );
      await screen.findByText('Revisa tu correo');
      expect(screen.getByTestId('icon-mailcheck')).toBeInTheDocument();
    });

    it('muestra el email en el mensaje de confirmación', async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null });
      render(<ForgotPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { value: 'usuario@test.com' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Enviar Enlace/i }).closest('form')!,
      );
      await screen.findByText('Revisa tu correo');
      expect(screen.getByText('usuario@test.com')).toBeInTheDocument();
    });

    it('muestra el link para volver al login desde la pantalla de confirmación', async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null });
      render(<ForgotPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { value: 'usuario@test.com' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Enviar Enlace/i }).closest('form')!,
      );
      await screen.findByText('Revisa tu correo');
      expect(
        screen.getByRole('link', { name: /Volver a Iniciar Sesión/i }),
      ).toHaveAttribute('href', '/login');
    });
  });

  describe('error al enviar', () => {
    it('muestra el mensaje de error si requestPasswordReset falla', async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: 'Correo no registrado.' });
      render(<ForgotPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { value: 'noexiste@test.com' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Enviar Enlace/i }).closest('form')!,
      );
      await screen.findByText('Correo no registrado.');
    });
  });

  describe('estado de carga', () => {
    it('deshabilita el botón y muestra "Enviando..." mientras se procesa', async () => {
      mockRequestPasswordReset.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
      );
      render(<ForgotPasswordScreen />);
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { value: 'usuario@test.com' },
      });
      fireEvent.submit(
        screen.getByRole('button', { name: /Enviar Enlace/i }).closest('form')!,
      );
      expect(await screen.findByRole('button', { name: /Enviando/i })).toBeDisabled();
    });
  });
});
