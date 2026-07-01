import { useEffect, useState } from 'react';
import { UserCircle, Plus } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import { useClinicalStore, type PatientData } from '../../../shared/store/useClinicalStore';
import { usePacientes } from '../../pacientes/hooks/usePacientes';

export const PatientInfoCard = () => {
    const router = useRouter();
    const { activePatient, setActivePatient } = useClinicalStore();
    const { data: patientsData, isLoading } = usePacientes();
    const patients = patientsData || [];

    const [selectedId, setSelectedId] = useState<string>('');
    const [nombre, setNombre] = useState('');
    const [edad, setEdad] = useState<number>(0);
    const [sexo, setSexo] = useState('');
    const [talla, setTalla] = useState<number>(0);
    const [peso, setPeso] = useState<number>(0);

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
            setNombre(`${p.nombre} ${p.apellido}`);
            setEdad(calculateAge(p.fecha_nacimiento));
            setSexo(p.sexo_biologico || '');

            // Extract from Evaluacion array if exists
            const lastEval = p.Evaluacion?.[0];
            setTalla(lastEval?.talla_cm || 0);
            setPeso(lastEval?.peso_actual || 0);
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

    // La creación de pacientes vive centralizada en Fichas de Pacientes
    // (/pacientes → ModalNuevoPaciente). Desde aquí solo se navega hacia allá,
    // para no duplicar el flujo de alta en el dashboard.
    const goToFichasPacientes = () => router.navigate({ to: '/pacientes' });

    return (
        <Card className="mb-6">
            <CardHeader title="Información del Paciente" icon={UserCircle} />
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="col-span-2 flex items-end gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                            <label className="block text-sm font-medium text-ink-soft mb-1">Nombre</label>
                            <select
                                className="w-full text-sm border border-mist rounded-md bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft p-2 outline-none"
                                value={selectedId}
                                onChange={handlePatientChange}
                                disabled={isLoading}
                            >
                                <option value="">{isLoading ? 'Cargando pacientes...' : 'Seleccione un paciente...'}</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={goToFichasPacientes}
                            className="bg-pine-soft/10 hover:bg-pine-soft/20 text-pine-soft p-2 rounded-md transition-colors duration-150 h-[38px] w-[38px] flex items-center justify-center flex-shrink-0"
                            title="Crear paciente en Fichas de Pacientes"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Edad</label>
                        <input type="number" readOnly className="w-full text-sm border border-mist rounded-md bg-mist/40 text-ink-soft p-2 cursor-not-allowed tnum" value={edad || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Sexo</label>
                        <input type="text" readOnly className="w-full text-sm border border-mist rounded-md bg-mist/40 text-ink-soft p-2 cursor-not-allowed tnum" value={sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : sexo || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Talla (cm)</label>
                        <input type="number" readOnly className="w-full text-sm border border-mist rounded-md bg-mist/40 text-ink-soft p-2 cursor-not-allowed tnum" value={talla || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Peso Real (kg)</label>
                        <input type="number" readOnly className="w-full text-sm border border-mist rounded-md bg-mist/40 text-ink-soft p-2 cursor-not-allowed tnum" value={peso || ''} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 mt-6 pt-4 border-t border-mist">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                        {(peso <= 0 || talla <= 0 || edad <= 0 || !sexo) && selectedId && (
                            <span className="text-xs text-apricot font-medium break-words">
                                Faltan datos requeridos (Edad, Sexo, Talla, Peso) para activarlo.
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!selectedId || peso <= 0 || talla <= 0 || edad <= 0 || !sexo}
                            className="w-full sm:w-auto bg-pine hover:bg-pine-soft text-porcelain px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            Establecer como paciente activo
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
