import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistorialEvaluaciones } from './HistorialEvaluaciones';
import type { Evaluacion } from '../types/evaluacion.types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockEvaluaciones: Evaluacion[] = [
  {
    id: 'eval-1',
    paciente_id: 'pac-1',
    nutricionista_id: 'nut-1',
    fecha_evaluacion: '2025-06-01T00:00:00.000Z',
    peso_actual: 75.5,
    talla_cm: 170,
    nivel_actividad_fisica: 'moderado',
    objetivo: 'perdida_peso',
    tmb: 1650,
    gasto_energetico_total: 2310,
  },
  {
    id: 'eval-2',
    paciente_id: 'pac-1',
    nutricionista_id: 'nut-1',
    fecha_evaluacion: '2025-03-15T00:00:00.000Z',
    peso_actual: 80,
    talla_cm: 168,
    nivel_actividad_fisica: 'sedentario',
    objetivo: 'mantencion',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderHistorial(
  overrides: Partial<React.ComponentProps<typeof HistorialEvaluaciones>> = {},
) {
  const defaults = {
    evaluaciones: mockEvaluaciones,
    isLoading: false,
    onUpdateEvaluation: vi.fn().mockResolvedValue(undefined),
    onDeleteEvaluation: vi.fn(),
    ...overrides,
  };
  return { ...render(<HistorialEvaluaciones {...defaults} />), props: defaults };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('HistorialEvaluaciones', () => {
  afterEach(() => vi.restoreAllMocks());

  // ── Estado de carga / vacío ────────────────────────────────────────────────

  it('muestra spinner mientras carga', () => {
    renderHistorial({ evaluaciones: undefined, isLoading: true });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay evaluaciones', () => {
    renderHistorial({ evaluaciones: [] });
    expect(screen.getByText(/no hay evaluaciones registradas/i)).toBeInTheDocument();
  });

  // ── Vista de lectura ───────────────────────────────────────────────────────

  it('renderiza un botón Editar y un botón Borrar por cada evaluación', () => {
    renderHistorial();
    expect(screen.getAllByRole('button', { name: /editar evaluación/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /borrar evaluación/i })).toHaveLength(2);
  });

  it('muestra los datos clínicos de cada evaluación en modo lectura', () => {
    renderHistorial();
    expect(screen.getByText('75.5 kg')).toBeInTheDocument();
    expect(screen.getByText('80 kg')).toBeInTheDocument();
    expect(screen.getByText('170 cm')).toBeInTheDocument();
    expect(screen.getByText('168 cm')).toBeInTheDocument();
    expect(screen.getByText('1650 kcal')).toBeInTheDocument();
    expect(screen.getByText('2310 kcal')).toBeInTheDocument();
    // eval-2 no tiene tmb ni GET → dos N/A
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  // ── Borrar ─────────────────────────────────────────────────────────────────

  it('llama a onDeleteEvaluation con el ID correcto cuando el usuario confirma', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { props } = renderHistorial();
    await userEvent.setup().click(screen.getAllByRole('button', { name: /borrar evaluación/i })[0]);
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(props.onDeleteEvaluation).toHaveBeenCalledTimes(1);
    expect(props.onDeleteEvaluation).toHaveBeenCalledWith('eval-1');
  });

  it('NO llama a onDeleteEvaluation cuando el usuario cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { props } = renderHistorial();
    await userEvent.setup().click(screen.getAllByRole('button', { name: /borrar evaluación/i })[0]);
    expect(props.onDeleteEvaluation).not.toHaveBeenCalled();
  });

  // ── Edición inline: apertura ───────────────────────────────────────────────

  it('al hacer clic en Editar, la tarjeta muestra los inputs de edición', async () => {
    renderHistorial();
    await userEvent.setup().click(screen.getAllByRole('button', { name: /editar evaluación/i })[0]);

    expect(screen.getByRole('spinbutton', { name: /peso actual/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /talla/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /nivel de actividad/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /objetivo/i })).toBeInTheDocument();
  });

  it('los inputs se pre-cargan con los valores actuales de la evaluación', async () => {
    renderHistorial();
    await userEvent.setup().click(screen.getAllByRole('button', { name: /editar evaluación/i })[0]);

    expect(screen.getByRole('spinbutton', { name: /peso actual/i })).toHaveValue(75.5);
    expect(screen.getByRole('spinbutton', { name: /talla/i })).toHaveValue(170);
    expect(screen.getByRole('combobox', { name: /nivel de actividad/i })).toHaveValue('moderado');
    expect(screen.getByRole('combobox', { name: /objetivo/i })).toHaveValue('perdida_peso');
  });

  it('al abrir la segunda tarjeta los inputs reflejan sus valores, no los de la primera', async () => {
    renderHistorial();
    await userEvent.setup().click(screen.getAllByRole('button', { name: /editar evaluación/i })[1]);

    expect(screen.getByRole('spinbutton', { name: /peso actual/i })).toHaveValue(80);
    expect(screen.getByRole('spinbutton', { name: /talla/i })).toHaveValue(168);
    expect(screen.getByRole('combobox', { name: /nivel de actividad/i })).toHaveValue('sedentario');
    expect(screen.getByRole('combobox', { name: /objetivo/i })).toHaveValue('mantencion');
  });

  // ── Edición inline: cancelar ───────────────────────────────────────────────

  it('al hacer clic en Cancelar, la tarjeta vuelve al modo de visualización', async () => {
    renderHistorial();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /editar evaluación/i })[0]);
    expect(screen.getByRole('spinbutton', { name: /peso actual/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar edición/i }));

    expect(screen.queryByRole('spinbutton', { name: /peso actual/i })).not.toBeInTheDocument();
    expect(screen.getByText('75.5 kg')).toBeInTheDocument();
  });

  // ── Edición inline: guardar ────────────────────────────────────────────────

  it('llama a onUpdateEvaluation con el ID y el payload correcto al guardar', async () => {
    const { props } = renderHistorial();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /editar evaluación/i })[0]);

    // Cambiar el peso usando fireEvent para inputs numéricos controlados
    fireEvent.change(screen.getByRole('spinbutton', { name: /peso actual/i }), {
      target: { value: '78' },
    });

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(props.onUpdateEvaluation).toHaveBeenCalledTimes(1);
    expect(props.onUpdateEvaluation).toHaveBeenCalledWith('eval-1', {
      peso_actual: 78,
      talla_cm: 170,
      nivel_actividad_fisica: 'moderado',
      objetivo: 'perdida_peso',
    });
  });

  it('cierra el modo edición después de guardar exitosamente', async () => {
    renderHistorial();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /editar evaluación/i })[0]);
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.queryByRole('spinbutton', { name: /peso actual/i })).not.toBeInTheDocument();
    });
    // Restaura los valores leídos
    expect(screen.getByText('75.5 kg')).toBeInTheDocument();
  });

  it('el botón Guardar está deshabilitado mientras se procesa la mutación', async () => {
    // La mutación no se resuelve inmediatamente (promise pendiente)
    let resolveSave!: () => void;
    const pendingUpdate = vi.fn().mockImplementation(
      () => new Promise<void>((res) => { resolveSave = res; }),
    );
    renderHistorial({ onUpdateEvaluation: pendingUpdate });
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /editar evaluación/i })[0]);
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Mientras la promesa sigue pendiente, el botón debe estar deshabilitado
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeDisabled();

    // Limpieza: resolver la promesa para que el componente termine de actualizar
    resolveSave();
    await waitFor(() =>
      expect(screen.queryByRole('spinbutton', { name: /peso actual/i })).not.toBeInTheDocument(),
    );
  });

  // ── Aislamiento entre tarjetas ─────────────────────────────────────────────

  it('solo una tarjeta entra en modo edición a la vez', async () => {
    renderHistorial();
    const user = userEvent.setup();

    const editBtns = screen.getAllByRole('button', { name: /editar evaluación/i });
    await user.click(editBtns[0]); // abre la primera
    await user.click(editBtns[1]); // abre la segunda (cierra implícitamente la primera)

    // Solo un campo Peso visible (la segunda tarjeta)
    expect(screen.getAllByRole('spinbutton', { name: /peso actual/i })).toHaveLength(1);
    expect(screen.getByRole('spinbutton', { name: /peso actual/i })).toHaveValue(80);
  });
});
