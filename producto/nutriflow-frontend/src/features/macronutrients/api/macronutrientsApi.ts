import { apiClient } from '../../../shared/api/apiClient';

export const saveMacronutrients = async (macroData: any) => {
    // Aquí el backend actualmente procesa la distribución a través de /pautas
    // Temporalmente lo conectaremos al dashboard o pautas dependiendo de la API existente
    // Asumiendo que va al dashboard clinico:
    const { data } = await apiClient.post('/dashboard-clinico/macronutrientes', macroData);
    return { success: true, data };
};