import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/utils/supabase';

export interface Alimento {
    id: string;
    nombre: string;
    categoria: string | null;
    calorias_100g: number;
    proteinas_100g: number;
    carbohidratos_100g: number;
    grasas_100g: number;
}

export function useAlimentos() {
    const [alimentos, setAlimentos] = useState<Alimento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAlimentos() {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('alimentos')
                    .select('*')
                    .order('nombre');

                if (error) throw error;
                
                // Si la tabla está vacía, proveemos unos mocks para que la UI funcione
                if (!data || data.length === 0) {
                    setAlimentos([
                        { id: 'mock-1', nombre: 'Avena', categoria: 'Cereales', calorias_100g: 389, proteinas_100g: 16.9, carbohidratos_100g: 66.3, grasas_100g: 6.9 },
                        { id: 'mock-2', nombre: 'Manzana', categoria: 'Frutas', calorias_100g: 52, proteinas_100g: 0.3, carbohidratos_100g: 13.8, grasas_100g: 0.2 },
                        { id: 'mock-3', nombre: 'Almendras', categoria: 'Frutos secos', calorias_100g: 579, proteinas_100g: 21.2, carbohidratos_100g: 21.6, grasas_100g: 49.9 },
                        { id: 'mock-4', nombre: 'Leche Descremada', categoria: 'Lácteos', calorias_100g: 34, proteinas_100g: 3.4, carbohidratos_100g: 5, grasas_100g: 0.1 },
                        { id: 'mock-5', nombre: 'Pechuga de Pollo', categoria: 'Carnes', calorias_100g: 165, proteinas_100g: 31, carbohidratos_100g: 0, grasas_100g: 3.6 },
                        { id: 'mock-6', nombre: 'Quinoa', categoria: 'Cereales', calorias_100g: 120, proteinas_100g: 4.4, carbohidratos_100g: 21.3, grasas_100g: 1.9 },
                    ]);
                } else {
                    setAlimentos(data);
                }
            } catch (e: any) {
                console.error("Error fetching alimentos:", e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAlimentos();
    }, []);

    return { alimentos, isLoading, error };
}
