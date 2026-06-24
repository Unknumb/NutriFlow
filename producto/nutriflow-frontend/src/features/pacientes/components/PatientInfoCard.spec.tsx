import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientInfoCard } from './PatientInfoCard';

vi.mock('../../../shared/ui/atoms/Card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ title }: any) => <div>{title}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../../shared/ui/atoms/Input', () => ({
  Input: ({ label, id, defaultValue, type }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} defaultValue={defaultValue} type={type} />
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  User: () => <span />,
  Calculator: () => <span data-testid="icon-calculator" />,
}));

describe('PatientInfoCard (pacientes — prototipo)', () => {
  describe('datos iniciales', () => {
    it('muestra el título "Información del Paciente"', () => {
      render(<PatientInfoCard />);
      expect(screen.getByText('Información del Paciente')).toBeInTheDocument();
    });

    it('muestra el campo Nombre con valor por defecto "Juan Pérez"', () => {
      render(<PatientInfoCard />);
      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
    });

    it('muestra el campo Edad con valor por defecto 45', () => {
      render(<PatientInfoCard />);
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });

    it('muestra el campo Talla con valor por defecto 175', () => {
      render(<PatientInfoCard />);
      expect(screen.getByDisplayValue('175')).toBeInTheDocument();
    });

    it('muestra el campo Peso Real con valor por defecto 85', () => {
      render(<PatientInfoCard />);
      expect(screen.getByDisplayValue('85')).toBeInTheDocument();
    });

    it('muestra el selector de Sexo con las opciones Masculino y Femenino', () => {
      render(<PatientInfoCard />);
      expect(screen.getByRole('option', { name: 'Masculino' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Femenino' })).toBeInTheDocument();
    });

    it('muestra el botón "Establecer como paciente activo"', () => {
      render(<PatientInfoCard />);
      expect(
        screen.getByRole('button', { name: /Establecer como paciente activo/i }),
      ).toBeInTheDocument();
    });

    it('muestra el texto "Recordar datos para la próxima sección"', () => {
      render(<PatientInfoCard />);
      expect(screen.getByText(/Recordar datos para la próxima sección/i)).toBeInTheDocument();
    });
  });

  describe('toggle de recordar datos', () => {
    it('el toggle empieza con clase bg-mist (desactivado)', () => {
      render(<PatientInfoCard />);
      const toggle = screen.getByRole('button', { name: '' });
      expect(toggle).toHaveClass('bg-mist');
    });

    it('al hacer clic el toggle cambia a bg-pine (activado)', () => {
      render(<PatientInfoCard />);
      const toggle = screen.getByRole('button', { name: '' });
      fireEvent.click(toggle);
      expect(toggle).toHaveClass('bg-pine');
    });

    it('un segundo clic vuelve el toggle a bg-mist', () => {
      render(<PatientInfoCard />);
      const toggle = screen.getByRole('button', { name: '' });
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(toggle).toHaveClass('bg-mist');
    });
  });
});
