import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';

// ── hoisted mocks ──────────────────────────────────────────────────────────
const mockSignOut = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const mockUseAuthStore = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className, inactiveProps, title, onClick }: any) => (
    <a href={to} className={className ?? inactiveProps?.className} title={title} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  Calculator: () => null,
  PieChart: () => null,
  FileText: () => null,
  Grid3x3: () => null,
  BookOpen: () => null,
  Sparkles: () => null,
  Users: () => null,
  LogOut: () => <span data-testid="icon-logout" />,
  Apple: () => null,
  Menu: () => <span data-testid="icon-menu" />,
}));

vi.mock('../../utils/supabase', () => ({
  supabase: { auth: { signOut: mockSignOut } },
}));

vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

// ── helpers ────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  email: 'ana@example.com',
  user_metadata: { nombre: 'Ana', apellido: 'González', avatar_url: undefined },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuthStore.mockReturnValue({ user: makeUser() });
  vi.stubGlobal('location', { href: '' });
});

describe('Sidebar', () => {
  describe('nombreCompleto — 3 fallbacks', () => {
    it('1er fallback: usa nombre + apellido de user_metadata', () => {
      render(<Sidebar />);
      // El span del perfil tiene title={nombreCompleto}
      expect(screen.getByTitle('Ana González')).toBeInTheDocument();
    });

    it('usa solo el nombre cuando no hay apellido', () => {
      mockUseAuthStore.mockReturnValue({
        user: makeUser({ user_metadata: { nombre: 'Ana', apellido: undefined } }),
      });
      render(<Sidebar />);
      expect(screen.getByTitle('Ana')).toBeInTheDocument();
    });

    it('2do fallback: usa el email cuando no hay nombre ni apellido', () => {
      mockUseAuthStore.mockReturnValue({
        user: makeUser({ user_metadata: {} }),
      });
      render(<Sidebar />);
      expect(screen.getByTitle('ana@example.com')).toBeInTheDocument();
    });

    it('3er fallback: usa "Nutricionista" cuando no hay usuario', () => {
      mockUseAuthStore.mockReturnValue({ user: null });
      render(<Sidebar />);
      expect(screen.getByTitle('Nutricionista')).toBeInTheDocument();
    });
  });

  describe('iniciales — máximo 2 letras en mayúscula', () => {
    it('toma las iniciales de nombre y apellido (Ana González → AG)', () => {
      render(<Sidebar />);
      expect(screen.getByText('AG')).toBeInTheDocument();
    });

    it('genera una sola inicial cuando el nombre es una palabra (Nutricionista → N)', () => {
      mockUseAuthStore.mockReturnValue({ user: null });
      render(<Sidebar />);
      expect(screen.getByText('N')).toBeInTheDocument();
    });

    it('genera inicial desde el email cuando no hay nombre (carlos@test.com → C)', () => {
      mockUseAuthStore.mockReturnValue({
        user: { email: 'carlos@test.com', user_metadata: {} },
      });
      render(<Sidebar />);
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('las iniciales siempre están en mayúsculas', () => {
      mockUseAuthStore.mockReturnValue({
        user: makeUser({ user_metadata: { nombre: 'ana', apellido: 'gonzález' } }),
      });
      render(<Sidebar />);
      expect(screen.getByText('AG')).toBeInTheDocument();
    });
  });

  describe('avatar', () => {
    it('muestra imagen cuando hay avatar_url', () => {
      mockUseAuthStore.mockReturnValue({
        user: makeUser({
          user_metadata: { nombre: 'Ana', apellido: 'González', avatar_url: 'https://cdn.example.com/foto.jpg' },
        }),
      });
      render(<Sidebar />);
      const img = screen.getByAltText('Foto de Ana González');
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/foto.jpg');
    });

    it('muestra span con iniciales cuando no hay avatar_url', () => {
      render(<Sidebar />);
      expect(screen.getByText('AG')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('navegación', () => {
    it('renderiza los 3 grupos de menú', () => {
      render(<Sidebar />);
      expect(screen.getByText('Clínica')).toBeInTheDocument();
      expect(screen.getByText('Planificación')).toBeInTheDocument();
      expect(screen.getByText('Catálogo')).toBeInTheDocument();
    });

    it('renderiza todos los ítems de navegación', () => {
      render(<Sidebar />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Fichas de Pacientes')).toBeInTheDocument();
      expect(screen.getByText('Macronutrientes')).toBeInTheDocument();
      expect(screen.getByText('Armador de Pautas')).toBeInTheDocument();
      expect(screen.getByText('Distribución de Porciones')).toBeInTheDocument();
      expect(screen.getByText('Biblioteca')).toBeInTheDocument();
      expect(screen.getByText('Generador Automático')).toBeInTheDocument();
      expect(screen.getByText('Alimentos')).toBeInTheDocument();
    });
  });

  describe('collapse / expand', () => {
    it('muestra "NutriFlow" por defecto (expandido)', () => {
      render(<Sidebar />);
      expect(screen.getByText('NutriFlow')).toBeInTheDocument();
    });

    it('colapsar oculta el título NutriFlow', () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByRole('button', { name: 'Colapsar menú' }));
      expect(screen.queryByText('NutriFlow')).not.toBeInTheDocument();
    });

    it('colapsar oculta las etiquetas de los grupos de menú', () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByRole('button', { name: 'Colapsar menú' }));
      expect(screen.queryByText('Clínica')).not.toBeInTheDocument();
    });

    it('expandir después de colapsar restaura el título NutriFlow', () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByRole('button', { name: 'Colapsar menú' }));
      fireEvent.click(screen.getByRole('button', { name: 'Expandir menú' }));
      expect(screen.getByText('NutriFlow')).toBeInTheDocument();
    });
  });

  describe('modal de logout', () => {
    it('el modal no es visible al montar', () => {
      render(<Sidebar />);
      expect(screen.queryByText('¿Cerrar sesión?')).not.toBeInTheDocument();
    });

    it('clic en el icono de logout abre el modal de confirmación', () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByTitle('Cerrar sesión'));
      expect(screen.getByText('¿Cerrar sesión?')).toBeInTheDocument();
    });

    it('clic en Cancelar cierra el modal sin cerrar sesión', () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByTitle('Cerrar sesión'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.queryByText('¿Cerrar sesión?')).not.toBeInTheDocument();
      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('clic en "Cerrar sesión" del modal llama a supabase.auth.signOut', async () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByTitle('Cerrar sesión'));
      // Botón del modal: tiene texto visible "Cerrar sesión" (el botón del footer solo tiene el icono)
      fireEvent.click(screen.getByText('Cerrar sesión', { selector: 'button' }));
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it('redirige a /login después de confirmar el cierre de sesión', async () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByTitle('Cerrar sesión'));
      fireEvent.click(screen.getByText('Cerrar sesión', { selector: 'button' }));
      await waitFor(() => {
        expect(window.location.href).toBe('/login');
      });
    });
  });
});
