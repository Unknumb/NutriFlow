import React, { useState } from 'react';
import { useAlimentos, Alimento } from '../hooks/useAlimentos';
import { createPortal } from 'react-dom';
import { Search, Plus, X, Utensils, Save } from 'lucide-react';

interface ModalNuevaPreparacionProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prep: any) => void;
}

export const ModalNuevaPreparacion: React.FC<ModalNuevaPreparacionProps> = ({ isOpen, onClose, onSave }) => {
    const { alimentos, isLoading } = useAlimentos();
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('Desayuno');
    const [busqueda, setBusqueda] = useState('');
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{ alimento: Alimento; gramos: number }[]>([]);

    if (!isOpen) return null;

    const alimentosFiltrados = alimentos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    const handleAddAlimento = (alimento: Alimento) => {
        if (!ingredientesSeleccionados.find(i => i.alimento.id === alimento.id)) {
            setIngredientesSeleccionados([...ingredientesSeleccionados, { alimento, gramos: 100 }]);
        }
    };

    const handleRemoveAlimento = (id: string) => {
        setIngredientesSeleccionados(ingredientesSeleccionados.filter(i => i.alimento.id !== id));
    };

    const handleChangeGramos = (id: string, gramos: number) => {
        setIngredientesSeleccionados(ingredientesSeleccionados.map(i => i.alimento.id === id ? { ...i, gramos } : i));
    };

    const caloriasTotales = ingredientesSeleccionados.reduce((acc, item) => {
        return acc + (item.alimento.calorias_100g * item.gramos) / 100;
    }, 0);

    const handleGuardar = () => {
        if (!nombre) return alert('Debes darle un nombre a la preparación');
        if (ingredientesSeleccionados.length === 0) return alert('Debes agregar al menos un ingrediente');

        const tags = ingredientesSeleccionados.map(i => ({
            nombre: i.alimento.nombre,
            color: 'bg-teal-100 text-teal-800' // Color genérico para la demo
        }));

        const nuevaPrep = {
            id: Date.now(), // ID temporal para el frontend
            nombre,
            tipo,
            calorias: Math.round(caloriasTotales),
            tags
        };

        onSave(nuevaPrep);
        
        // Limpiar estado
        setNombre('');
        setBusqueda('');
        setIngredientesSeleccionados([]);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Utensils className="w-6 h-6 text-teal-600" />
                            Nueva Preparación
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Crea una nueva receta usando la base de datos de alimentos</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body (2 columns) */}
                <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                    
                    {/* Left Column: Form & Search */}
                    <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Preparación</label>
                            <input 
                                type="text" 
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Avena con plátano"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comida</label>
                            <select 
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            >
                                <option>Desayuno</option>
                                <option>Almuerzo</option>
                                <option>Colación</option>
                                <option>Cena</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Alimentos</label>
                            <div className="relative mb-3">
                                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <input 
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar en la base de datos..."
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-gray-50"
                                />
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 max-h-[300px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">Cargando alimentos de Supabase...</div>
                                ) : alimentosFiltrados.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">No se encontraron alimentos</div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {alimentosFiltrados.map(alimento => (
                                            <li key={alimento.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{alimento.nombre}</p>
                                                    <p className="text-xs text-gray-500">{alimento.calorias_100g} kcal / 100g</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleAddAlimento(alimento)}
                                                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Selected Ingredients & Summary */}
                    <div className="w-1/2 flex flex-col bg-gray-50 rounded-xl border border-gray-200 p-5 overflow-hidden">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                            Ingredientes Seleccionados
                            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{ingredientesSeleccionados.length}</span>
                        </h3>

                        <div className="flex-1 overflow-y-auto mb-4 min-h-0">
                            {ingredientesSeleccionados.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <Utensils className="w-12 h-12 mb-2 opacity-20" />
                                    No has agregado ingredientes
                                </div>
                            ) : (
                                <ul className="space-y-3 pr-2">
                                    {ingredientesSeleccionados.map((item) => (
                                        <li key={item.alimento.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{item.alimento.nombre}</p>
                                                <p className="text-xs text-gray-500">
                                                    {Math.round((item.alimento.calorias_100g * item.gramos) / 100)} kcal
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    min="1"
                                                    value={item.gramos}
                                                    onChange={(e) => handleChangeGramos(item.alimento.id, Number(e.target.value))}
                                                    className="w-20 border border-gray-300 rounded text-sm p-1 text-center outline-none focus:border-teal-500"
                                                />
                                                <span className="text-xs text-gray-500 font-medium">g</span>
                                                <button 
                                                    onClick={() => handleRemoveAlimento(item.alimento.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Totals & Save */}
                        <div className="border-t border-gray-200 pt-4 mt-auto">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total estimado</p>
                                    <p className="text-3xl font-bold text-gray-900">{Math.round(caloriasTotales)} <span className="text-base font-medium text-gray-500">kcal</span></p>
                                </div>
                            </div>
                            <button 
                                onClick={handleGuardar}
                                disabled={ingredientesSeleccionados.length === 0 || !nombre}
                                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                            >
                                <Save className="w-5 h-5" />
                                Guardar Preparación
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};
