import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('devuelve el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebouncedValue('inicial', 300));
    expect(result.current).toBe('inicial');
  });

  it('no actualiza el valor antes de que transcurra el delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'inicial' } },
    );
    rerender({ value: 'nuevo' });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('inicial');
  });

  it('actualiza el valor exactamente cuando transcurre el delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'inicial' } },
    );
    rerender({ value: 'nuevo' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('nuevo');
  });

  it('cancela el timer pendiente si el valor cambia antes del delay (solo se aplica el último cambio)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'A' } },
    );
    rerender({ value: 'B' });
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ value: 'C' });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('A');
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('C');
  });

  it('usa el delay por defecto de 300ms cuando no se pasa delayMs', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 0 } },
    );
    rerender({ value: 1 });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe(0);
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe(1);
  });

  it('funciona con valores no primitivos (objetos)', () => {
    const obj1 = { x: 1 };
    const obj2 = { x: 2 };
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: obj1 } },
    );
    rerender({ value: obj2 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toEqual({ x: 2 });
  });

  it('limpia el timer al desmontar (no produce advertencias de estado en componente desmontado)', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'A' } },
    );
    rerender({ value: 'B' });
    unmount();
    // Si el timer no se canceló, esto lanzaría un error de act() al avanzar el tiempo
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('A'); // sigue siendo el valor previo al unmount
  });
});
