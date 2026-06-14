import { useEffect, useState } from 'react';
import { UserCircle, Plus, X, Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/atoms/Card';
import { useClinicalStore, type PatientData } from '../../../shared/store/useClinicalStore';
import { usePacientes, useCreatePaciente } from '../../pacientes/hooks/usePacientes';

export const PatientInfoCard = () => {
    const { activePatient, setActivePatient } = useClinicalStore();
    const { data: patientsData, isLoading } = usePacientes();
    const patients = patientsData || [];
    const createPacienteMutation = useCreatePaciente();
    
    const [selectedId, setSelectedId] = useState<string>('');
    const [nombre, setNombre] = useState('');
    const [edad, setEdad] = useState<number>(0);
    const [sexo, setSexo] = useState('');
    const [talla, setTalla] = useState<number>(0);
    const [peso, setPeso] = useState<number>(0);

    const [isCreating, setIsCreating] = useState(false);
    const [newNombre, setNewNombre] = useState('');
    const [newApellido, setNewApellido] = useState('');
    const [newFechaNacimiento, setNewFechaNacimiento] = useState('');
    const [newSexo, setNewSexo] = useState('');
    const [newTalla, setNewTalla] = useState<number | ''>('');
    const [newPeso, setNewPeso] = useState<number | ''>('');

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

    const handleCreatePatient = async () => {
        if (!newNombre || !newApellido || !newFechaNacimiento || !newSexo || !newTalla || !newPeso) return;
        
        try {
            const newPatient = await createPacienteMutation.mutateAsync({
                nombre: newNombre,
                apellido: newApellido,
                fecha_nacimiento: newFechaNacimiento,
                sexo_biologico: newSexo,
                talla_cm: Number(newTalla),
                peso_kg: Number(newPeso)
            });

            setIsCreating(false);
            setNewNombre(''); setNewApellido(''); setNewFechaNacimiento(''); setNewSexo(''); setNewTalla(''); setNewPeso('');
            
            // Select the newly created patient
            setSelectedId(newPatient.id);
            setNombre(`${newPatient.nombre} ${newPatient.apellido}`);
            setEdad(calculateAge(newPatient.fecha_nacimiento));
            setSexo(newPatient.sexo_biologico || '');
            const lastEval = newPatient.Evaluacion?.[0];
            setTalla(lastEval?.talla_cm || Number(newTalla));
            setPeso(lastEval?.peso_actual || Number(newPeso));
            
        } catch (error) {
            console.error("Error al crear paciente", error);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader title="Información del Paciente" icon={UserCircle} />
            <CardContent>
                {isCreating ? (
                    <div className="bg-porcelain p-4 rounded-md border border-mist mb-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-pine-soft">Crear nuevo paciente</h3>
                            <button onClick={() => setIsCreating(false)} className="text-ink-soft/60 hover:text-ink transition-colors duration-150">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-ink-soft mb-1">Nombre</label>
                                <input type="text" className="w-full text-sm border border-mist rounded-md p-2 bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft outline-none" value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Ej. Juan" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-ink-soft mb-1">Apellido</label>
                                <input type="text" className="w-full text-sm border border-mist rounded-md p-2 bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft outline-none" value={newApellido} onChange={e => setNewApellido(e.target.value)} placeholder="Ej. Pérez" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-ink-soft mb-1">F. Nacimiento</label>
                                <input type="date" className="w-full text-sm border border-mist rounded-md p-2 bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft outline-none" value={newFechaNacimiento} onChange={e => setNewFechaNacimiento(e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-ink-soft mb-1">Sexo Biológico</label>
                                <select className="w-full text-sm border border-mist rounded-md p-2 bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft outline-none" value={newSexo} onChange={e => setNewSexo(e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-ink-soft mb-1">Talla Inicial (cm)</label>
                                <input type="number" className="w-full text-sm border border-mist rounded-md p-2 bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft outline-none" value={newTalla} onChange={e => setNewTalla(e.target.value ? Number(e.target.value) : '')} placeholder="170" />
                            </div>
                            <div className="col-span-2 flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-ink-soft mb-1">Peso Inicial (kg)</label>
                                    <input type="number" className="w-full text-sm border border-mist rounded-md p-2 bg-white text-ink focus:ring-1 focus:ring-pine-soft focus:border-pine-soft outline-none" value={newPeso} onChange={e => setNewPeso(e.target.value ? Number(e.target.value) : '')} placeholder="70" />
                                </div>
                                <button 
                                    onClick={handleCreatePatient}
                                    disabled={!newNombre || !newApellido || !newFechaNacimiento || !newSexo || !newTalla || !newPeso || createPacienteMutation.isPending}
                                    className="bg-pine hover:bg-pine-soft text-porcelain p-2 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[38px] w-[38px]"
                                    title="Guardar Paciente"
                                >
                                    <Save size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                        <div className="col-span-2 flex items-end gap-2">
                            <div className="flex-1">
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
                                onClick={() => setIsCreating(true)}
                                className="bg-pine-soft/10 hover:bg-pine-soft/20 text-pine-soft p-2 rounded-md transition-colors duration-150 h-[38px] w-[38px] flex items-center justify-center flex-shrink-0"
                                title="Crear Nuevo Paciente"
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
                )}

                {!isCreating && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-mist">
                        <div className="flex items-center">
                            <input id="recordar" type="checkbox" className="h-4 w-4 accent-pine border-mist rounded" />
                            <label htmlFor="recordar" className="ml-2 block text-sm text-ink-soft">
                                Recordar datos para la próxima sesión
                            </label>
                        </div>
                        <div className="flex items-center space-x-4">
                            {(peso <= 0 || talla <= 0 || edad <= 0 || !sexo) && selectedId && (
                                <span className="text-xs text-apricot font-medium">
                                    Faltan datos requeridos (Edad, Sexo, Talla, Peso) para activarlo.
                                </span>
                            )}
                            <button 
                                onClick={handleSave}
                                disabled={!selectedId || peso <= 0 || talla <= 0 || edad <= 0 || !sexo}
                                className="bg-pine hover:bg-pine-soft text-porcelain px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Establecer como paciente activo
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
