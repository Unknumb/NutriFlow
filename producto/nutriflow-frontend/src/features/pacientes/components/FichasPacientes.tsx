// src/features/pacientes/components/FichasPacientes.tsx
import React, { useState } from 'react';

// --- MOCK DATA ---
const PACIENTES = [
  { id: 1, iniciales: 'MG', nombre: 'María González', edad: 35, sexo: 'Femenino', peso: '72 kg', sintomas: 2, activo: true, telefono: '+56 9 8765 4321', email: 'maria.gonzalez@email.com', ultimaConsulta: '09-03-2026', proximaConsulta: '06-04-2026' },
  { id: 2, iniciales: 'CM', nombre: 'Carlos Muñoz', edad: 42, sexo: 'Masculino', peso: '90 kg', sintomas: 1, activo: false, telefono: '+56 9 1234 5678', email: 'carlos.munoz@email.com', ultimaConsulta: '15-02-2026', proximaConsulta: 'Por agendar' },
  { id: 3, iniciales: 'AR', nombre: 'Ana Rodríguez', edad: 28, sexo: 'Femenino', peso: '61 kg', sintomas: 1, activo: false, telefono: '+56 9 9876 5432', email: 'ana.rodriguez@email.com', ultimaConsulta: '01-03-2026', proximaConsulta: '10-04-2026' },
];

export const FichasPacientes: React.FC = () => {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(PACIENTES[0]);
  const [activeTab, setActiveTab] = useState('datos');

  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1 overflow-hidden w-full">
      <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* Encabezado Principal */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Fichas de Pacientes</h1>
          <p className="text-gray-600 mt-1">Gestión y seguimiento clínico</p>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* PANEL IZQUIERDO: LISTA DE PACIENTES */}
          <div className="col-span-4 flex flex-col min-h-0">
            <div className="bg-white text-gray-900 flex flex-col rounded-xl border border-gray-200 h-full overflow-hidden shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h4 className="font-semibold text-lg leading-none mb-1">Pacientes Activos</h4>
                <p className="text-sm text-gray-600">3 pacientes en seguimiento</p>
              </div>
              
              <div className="px-6 py-4 flex-1 overflow-y-auto space-y-3">
                {PACIENTES.map((paciente) => (
                  <div 
                    key={paciente.id}
                    onClick={() => setPacienteSeleccionado(paciente)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      pacienteSeleccionado.id === paciente.id 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-teal-100 text-teal-700 font-medium">
                          {paciente.iniciales}
                        </span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{paciente.nombre}</p>
                        <p className="text-sm text-gray-600">{paciente.edad} años · {paciente.sexo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium text-gray-700 bg-white shadow-sm">
                            {paciente.peso}
                          </span>
                          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                            {paciente.sintomas} síntomas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: DETALLES DEL PACIENTE */}
          <div className="col-span-8 flex flex-col min-h-0">
            <div className="bg-white text-gray-900 flex flex-col rounded-xl border border-gray-200 h-full overflow-hidden shadow-sm">
              
              <div className="px-6 pt-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xl font-medium">
                        {pacienteSeleccionado.iniciales}
                      </span>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{pacienteSeleccionado.nombre}</h2>
                      <p className="text-gray-600">Nutricionista: Dr. Álvaro Uribe</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-md border border-teal-300 px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-800">
                    Paciente Activo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    {pacienteSeleccionado.telefono}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    {pacienteSeleccionado.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                    Última consulta: {pacienteSeleccionado.ultimaConsulta}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                    Próxima consulta: {pacienteSeleccionado.proximaConsulta}
                  </div>
                </div>

                {/* MENÚ PESTAÑAS */}
                <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-3 gap-1 mb-4">
                  <button 
                    onClick={() => setActiveTab('datos')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'datos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Datos Clínicos
                  </button>
                  <button 
                    onClick={() => setActiveTab('sintomas')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'sintomas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Síntomas Reportados
                    <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-md text-[10px]">{pacienteSeleccionado.sintomas}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('progreso')}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'progreso' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Progreso
                  </button>
                </div>
              </div>

              {/* CONTENIDO PESTAÑAS */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                
                {/* --- TAB 1: DATOS CLÍNICOS --- */}
                {activeTab === 'datos' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h4 className="font-semibold text-gray-900 mb-2 mt-2">Información Antropométrica</h4>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Talla</p>
                        <p className="text-2xl font-semibold text-gray-900">165 cm</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Peso Inicial</p>
                        <p className="text-2xl font-semibold text-gray-900">78 kg</p>
                      </div>
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <p className="text-sm text-teal-700 mb-1">Peso Actual</p>
                        <p className="text-2xl font-semibold text-teal-800">{pacienteSeleccionado.peso}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">IMC Actual</p>
                        <p className="text-xl font-semibold text-gray-900">26.4</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Cambio de Peso</p>
                        <p className="text-xl font-semibold text-gray-900">-6.0 kg</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">Objetivo del Tratamiento</p>
                      <p className="text-sm text-blue-800">Reducción de peso y mejora metabólica</p>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: SÍNTOMAS --- */}
                {activeTab === 'sintomas' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="mb-2 mt-2">
                      <h4 className="font-semibold text-gray-900">Síntomas y Observaciones</h4>
                      <p className="text-sm text-gray-600">Registro de síntomas reportados por el paciente</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-sm font-semibold text-gray-900 mb-2 block">Reportar Nuevo Síntoma</label>
                      <textarea 
                        className="w-full min-h-[80px] p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none mb-3" 
                        placeholder="Describe el síntoma o sensación..."
                      ></textarea>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Tipo</label>
                          <select className="w-full p-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-teal-500">
                            <option>Digestivo</option>
                            <option>Energía</option>
                            <option>Peso</option>
                            <option>Otro</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Severidad</label>
                          <select className="w-full p-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-teal-500">
                            <option>Leve</option>
                            <option>Moderado</option>
                            <option>Severo</option>
                          </select>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                        Agregar Síntoma
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">Energía</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 text-xs font-medium rounded-md">Leve</span>
                          </div>
                          <span className="text-xs text-gray-500">19-03-2026</span>
                        </div>
                        <p className="text-sm text-gray-700">He notado más energía durante las mañanas y menos ansiedad por comer entre comidas</p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">Digestivo</span>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-medium rounded-md">Moderado</span>
                          </div>
                          <span className="text-xs text-gray-500">14-03-2026</span>
                        </div>
                        <p className="text-sm text-gray-700">Tuve distensión abdominal después del almuerzo del domingo, creo que comí demasiado rápido</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 3: PROGRESO --- */}
                {activeTab === 'progreso' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                      <h4 className="font-semibold text-gray-900">Evolución del Tratamiento</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-700"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                          <p className="text-sm font-medium text-teal-900">Pérdida de Peso</p>
                        </div>
                        <p className="text-3xl font-semibold text-teal-700">6.0 kg</p>
                        <p className="text-xs text-teal-600 mt-1">7.7% del peso inicial</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                          <p className="text-sm font-medium text-blue-900">Tiempo en Tratamiento</p>
                        </div>
                        <p className="text-3xl font-semibold text-blue-700">5 meses</p>
                        <p className="text-xs text-blue-600 mt-1">Desde 14-12-2025</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-6">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Resumen de Adherencia</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Consultas asistidas</span>
                          <span className="text-sm font-semibold text-gray-900">8/8</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Síntomas reportados</span>
                          <span className="text-sm font-semibold text-gray-900">{pacienteSeleccionado.sintomas}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-sm text-gray-600">Estado del tratamiento</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-md">En progreso</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};