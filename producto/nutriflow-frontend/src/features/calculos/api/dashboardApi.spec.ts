import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { useDashboardClinico } from './dashboardApi';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false, isError: false }),
}));

vi.mock('../../../shared/api/apiClient', () => ({
  apiClient: { get: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockGet = vi.mocked(apiClient.get);

const PACIENTE = { id: 'pac-1', peso: 70, talla: 165, edad: 30, sexo: 'F' };

beforeEach(() => {
  vi.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
});

describe('useDashboardClinico', () => {
  it('usa queryKey que incluye todos los campos del paciente', () => {
    renderHook(() => useDashboardClinico(PACIENTE));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.queryKey).toEqual(['dashboard', 'pac-1', 70, 165, 30, 'F']);
  });

  it('enabled=true cuando el paciente tiene id', () => {
    renderHook(() => useDashboardClinico(PACIENTE));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(true);
  });

  it('enabled=false cuando patient es null', () => {
    renderHook(() => useDashboardClinico(null));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    expect(opts.enabled).toBe(false);
  });

  it('queryFn llama a apiClient.get con la URL y parámetros correctos', async () => {
    renderHook(() => useDashboardClinico(PACIENTE));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    const mockResponse = { pacienteId: 'pac-1', tmb: {}, macros: {}, pesos: null, status: 'ok' };
    mockGet.mockResolvedValue({ data: mockResponse });
    const result = await opts.queryFn();
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard-clinico/pac-1'),
    );
    const url: string = mockGet.mock.calls[0][0];
    expect(url).toContain('peso=70');
    expect(url).toContain('talla=165');
    expect(url).toContain('edad=30');
    expect(url).toContain('sexo=F');
    expect(result).toEqual(mockResponse);
  });

  it('queryFn lanza error si se llama sin paciente (guarda interna de seguridad)', async () => {
    renderHook(() => useDashboardClinico(null));
    const [opts] = mockUseQuery.mock.calls[0] as any;
    await expect(opts.queryFn()).rejects.toThrow();
  });
});
