import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../shared/api/apiClient';
import { saveMacronutrients } from './macronutrientsApi';

vi.mock('../../../shared/api/apiClient', () => ({
  apiClient: { post: vi.fn() },
}));

const mockPost = vi.mocked(apiClient.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('saveMacronutrients', () => {
  it('llama a POST /dashboard-clinico/macronutrientes con el payload', async () => {
    const payload = { proteinas: 150, carbohidratos: 250, grasas: 70 };
    const backendData = { id: 'macro-1', guardado: true };
    mockPost.mockResolvedValue({ data: backendData });
    const result = await saveMacronutrients(payload);
    expect(mockPost).toHaveBeenCalledWith('/dashboard-clinico/macronutrientes', payload);
    expect(result).toEqual({ success: true, data: backendData });
  });

  it('siempre envuelve la respuesta en { success: true, data }', async () => {
    mockPost.mockResolvedValue({ data: null });
    const result = await saveMacronutrients({});
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});
