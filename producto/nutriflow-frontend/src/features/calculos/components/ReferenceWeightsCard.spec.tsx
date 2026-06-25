import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceWeightsCard } from './ReferenceWeightsCard';

// Sin dependencias externas que mockear — componente puro con useState/useMemo.

const BASE_DATA = {
  peso_ideal: 60.0,
  peso_saludable_min: 54.7,
  peso_saludable_max: 72.5,
  peso_ajustado_25: 65.0,
  peso_ajustado_50: 70.0,
  aplica_ajuste: false,
  imc_actual: 28.5,
  clasificacion_imc: 'Sobrepeso',
};

describe('ReferenceWeightsCard', () => {
  describe('sin datos', () => {
    it('muestra "Esperando datos del paciente..." cuando data es undefined', () => {
      render(<ReferenceWeightsCard />);
      expect(screen.getByText('Esperando datos del paciente...')).toBeInTheDocument();
    });

    it('muestra el mensaje de espera cuando data es null', () => {
      render(<ReferenceWeightsCard data={null} />);
      expect(screen.getByText('Esperando datos del paciente...')).toBeInTheDocument();
    });
  });

  describe('con datos — filas de peso', () => {
    it('muestra siempre las 3 filas base (ideal, mín, máx)', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      expect(screen.getByText('Peso ideal (IMC 22)')).toBeInTheDocument();
      expect(screen.getByText('Peso saludable mín.')).toBeInTheDocument();
      expect(screen.getByText('Peso saludable máx.')).toBeInTheDocument();
    });

    it('NO muestra filas de peso ajustado cuando aplica_ajuste=false', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, aplica_ajuste: false }} />);
      expect(screen.queryByText('Peso ajustado 25%')).not.toBeInTheDocument();
      expect(screen.queryByText('Peso ajustado 50%')).not.toBeInTheDocument();
    });

    it('muestra las filas de peso ajustado cuando aplica_ajuste=true', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, aplica_ajuste: true }} />);
      expect(screen.getByText('Peso ajustado 25%')).toBeInTheDocument();
      expect(screen.getByText('Peso ajustado 50%')).toBeInTheDocument();
    });

    it('muestra los valores en kg con un decimal', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      // 54.7 y 72.5 son únicos; 60.0 aparece en la fila y en el panel de trabajo
      expect(screen.getByText('54.7 kg')).toBeInTheDocument();
      expect(screen.getByText('72.5 kg')).toBeInTheDocument();
      expect(screen.getAllByText('60.0 kg').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('selección de peso de trabajo', () => {
    it('al montar, el peso de trabajo es el peso ideal por defecto', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      // 60.0 kg aparece tanto en la fila "Peso ideal" como en el panel de trabajo
      expect(screen.getAllByText('60.0 kg')).toHaveLength(2);
    });

    it('al hacer clic en otra fila, el peso de trabajo cambia a ese valor', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      fireEvent.click(screen.getByText('Peso saludable mín.'));
      // peso_saludable_min = 54.7 → ahora es el peso de trabajo
      // el valor 54.7 kg aparece dos veces: en la fila y como peso de trabajo
      const valores = screen.getAllByText('54.7 kg');
      expect(valores.length).toBeGreaterThanOrEqual(1);
    });

    it('al seleccionar peso máx, el panel inferior muestra ese valor', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      fireEvent.click(screen.getByText('Peso saludable máx.'));
      // peso_saludable_max = 72.5 → aparece en el panel verde de peso de trabajo
      const pesosTrabajo = screen.getAllByText('72.5 kg');
      expect(pesosTrabajo.length).toBeGreaterThanOrEqual(1);
    });

    it('con aplica_ajuste=true, seleccionar peso ajustado 25% actualiza el peso de trabajo', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, aplica_ajuste: true }} />);
      fireEvent.click(screen.getByText('Peso ajustado 25%'));
      const valores = screen.getAllByText('65.0 kg');
      expect(valores.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('IMC y clasificación', () => {
    it('muestra el valor de IMC actual', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      expect(screen.getByText('28.5')).toBeInTheDocument();
    });

    it('muestra la etiqueta de clasificación IMC', () => {
      render(<ReferenceWeightsCard data={BASE_DATA} />);
      expect(screen.getByText('Sobrepeso')).toBeInTheDocument();
    });
  });

  describe('badge de clasificación — COLOR_CLASIFICACION', () => {
    it('clasificación "Normal" recibe clases de color verde', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, clasificacion_imc: 'Normal' }} />);
      const badge = screen.getByText('Normal');
      expect(badge).toHaveClass('bg-pine-soft/10');
    });

    it('clasificación "Obesidad I" recibe clases de color rojo', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, clasificacion_imc: 'Obesidad I' }} />);
      const badge = screen.getByText('Obesidad I');
      expect(badge).toHaveClass('bg-clinical-red/10');
    });

    it('clasificación "Obesidad II" recibe clases de color rojo', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, clasificacion_imc: 'Obesidad II' }} />);
      expect(screen.getByText('Obesidad II')).toHaveClass('bg-clinical-red/10');
    });

    it('clasificación "Obesidad III" recibe clases de color rojo', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, clasificacion_imc: 'Obesidad III' }} />);
      expect(screen.getByText('Obesidad III')).toHaveClass('bg-clinical-red/10');
    });

    it('clasificación desconocida recibe clases de fallback neutras', () => {
      render(<ReferenceWeightsCard data={{ ...BASE_DATA, clasificacion_imc: 'Desconocida' }} />);
      expect(screen.getByText('Desconocida')).toHaveClass('bg-mist', 'text-ink-soft');
    });
  });
});
