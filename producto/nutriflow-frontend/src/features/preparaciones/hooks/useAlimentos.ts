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
                
                setAlimentos(data || []);
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
