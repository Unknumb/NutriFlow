import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import { supabase } from '../../../shared/utils/supabase';
import { useClinicalStore, type PatientData } from '../../../shared/store/useClinicalStore';

export const PatientInfoCard = () => {
    const { activePatient, setActivePatient } = useClinicalStore();
    const [patients, setPatients] = useState<any[]>([]);
    
    const [selectedId, setSelectedId] = useState<string>('');
    const [nombre, setNombre] = useState('');
    const [edad, setEdad] = useState<number>(0);
    const [sexo, setSexo] = useState('');
    const [talla, setTalla] = useState<number>(0);
    const [peso, setPeso] = useState<number>(0);

    useEffect(() => {
        const fetchPatients = async () => {
            const { data } = await supabase.from('pacientes').select('*');
            if (data) setPatients(data);
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        if (activePatient) {
            setSelectedId(activePatient.id);
            setNombre(activePatient.nombre);
            setEdad(activePatient.edad);
            setSexo(activePatient.sexo);
            setTalla(activePatient.talla);
            setPeso(activePatient.peso);
        }
    }, [activePatient]);

    const calculateAge = (birthDateString: string | undefined | null) => {
        if (!birthDateString) return 0;
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedId(id);
        const p = patients.find(p => p.id === id);
        if (p) {
            setNombre(p.nombre);
            setEdad(calculateAge(p.fecha_nacimiento));
            setSexo(p.sexo_biologico || p.sexo || '');
            setTalla(p.talla_cm || p.altura || 0);
            setPeso(p.peso_kg || p.peso || 0);
        } else {
            setNombre(''); setEdad(0); setSexo(''); setTalla(0); setPeso(0);
        }
    };

    const handleSave = () => {
        if (!selectedId) return;
        const data: PatientData = {
            id: selectedId,
            nombre,
            edad,
            sexo,
            talla,
            peso
        };
        setActivePatient(data);
    };

    return (
        <Card className="mb-6">
            <CardHeader title="Información del Paciente" icon={UserCircle} />
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <select 
                            className="w-full text-sm border-gray-300 rounded-md bg-gray-50 focus:ring-teal-500 focus:border-teal-500 p-2 border"
                            value={selectedId}
                            onChange={handlePatientChange}
                        >
                            <option value="">Seleccione un paciente...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input type="number" readOnly className="w-full text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500 p-2 border cursor-not-allowed" value={edad || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                        <input type="text" readOnly className="w-full text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500 p-2 border cursor-not-allowed" value={sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : sexo || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Talla (cm)</label>
                        <input type="number" className="w-full text-sm border-gray-300 rounded-md bg-white p-2 border focus:ring-teal-500 focus:border-teal-500" value={talla || ''} onChange={e => setTalla(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso Real (kg)</label>
                        <input type="number" className="w-full text-sm border-gray-300 rounded-md bg-white p-2 border focus:ring-teal-500 focus:border-teal-500" value={peso || ''} onChange={e => setPeso(Number(e.target.value))} />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                        <input id="recordar" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                        <label htmlFor="recordar" className="ml-2 block text-sm text-gray-600">
                            Recordar datos para la próxima sesión
                        </label>
                    </div>
                    <div className="flex items-center space-x-4">
                        {(peso <= 0 || talla <= 0 || edad <= 0 || !sexo) && (
                            <span className="text-xs text-amber-600 font-medium">
                                Por favor completa Edad, Sexo, Talla y Peso (mayores a 0) para activar.
                            </span>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={!selectedId || peso <= 0 || talla <= 0 || edad <= 0 || !sexo}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Establecer como paciente activo
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
