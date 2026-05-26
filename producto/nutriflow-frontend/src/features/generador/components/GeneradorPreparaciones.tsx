import React, { useState } from 'react';

// --- NUEVO: Datos para la pestaña de Biblioteca ---
const BIBLIOTECA_RECETAS = [
  { id: 1, nombre: 'Sándwich de huevo', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Pan molde con huevos revueltos o fritos y queso Gauda. Preparación rápida y proteica.' },
  { id: 2, nombre: 'Sándwich de pollo', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Pan molde con pollo desmenuzado y queso crema. Ideal para preparar la noche anterior.' },
  { id: 3, nombre: 'Sándwich de atún', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Pan molde con atún mezclado con yogurt natural como mayonesa saludable. Se puede agregar lechuga, tomate y cebolla morada.' },
  { id: 4, nombre: 'Sándwich de salmón ahumado', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Pan molde con salmón ahumado y queso crema. Agregar lechuga, tomate y cebolla morada.' },
  { id: 5, nombre: 'Fajita de atún', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Tortilla XL con atún mezclado con yogurt natural. Agregar verduras a gusto.' },
  { id: 6, nombre: 'Fajita de carne', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Tortilla XL con carne vacuna y queso Gauda. Agregar lechuga, tomate, pepino y cebolla morada.' },
  { id: 7, nombre: 'Fajita de pollo', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Tortillas medianas con pollo y queso crema. Agregar lechuga, tomate, pepino y cebolla morada.' },
  { id: 8, nombre: 'Fajita de salmón', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Tortillas medianas con salmón ahumado y queso crema. Agregar lechuga, tomate, pepino.' },
  { id: 9, nombre: 'Omelette con tostadas', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Omelette de huevo relleno de queso Gauda con tomate Cherry, espinaca, morrón y albahaca, acompañado de tostadas.' },
  { id: 10, nombre: 'Panqueques de avena', tipo: 'Dulce', color: 'amber', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Licuar avena, huevos y leche. Cocinar en sartén. Se puede endulzar con canela y polvo de hornear.' },
  { id: 11, nombre: 'Yogurt protein con granola', tipo: 'Dulce', color: 'amber', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Yogurt proteico con granola o avena encima. Rápido, sin preparación.' },
  { id: 12, nombre: 'Leche con cereal y huevos', tipo: 'Dulce', color: 'amber', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥛 1 Lácteos'], desc: 'Tazón de leche con cereal/granola y huevos duros al lado como fuente proteica.' },
  { id: 13, nombre: 'Ensalada de pollo con quinoa', tipo: 'Salada', color: 'sky', ingredientes: ['🌾 1 Cereales', '🥩 2 Proteínas', '🥦 2 Verduras', '🥑 1 Grasas'], desc: 'Bowl de ensalada con pollo, quinoa, lechuga y tomate. Aliñar con aceite de oliva y limón.' },
];

// Mini-componente para reciclar las filas de porciones sin repetir código
const PorcionRow = ({ emoji, nombre, color, cantidad }: { emoji: string, nombre: string, color: string, cantidad: number }) => (
  <div className="flex items-center justify-between">
    <span className={`text-xs font-medium ${color}`}>{emoji} {nombre}</span>
    <div className="flex items-center gap-1.5">
      <button className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xs">−</button>
      <span className="w-5 text-center text-sm font-medium text-gray-900">{cantidad}</span>
      <button className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xs">+</button>
    </div>
  </div>
);

export const GeneradorPreparaciones: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generador');
  const [alimentosRechazados, setAlimentosRechazados] = useState('');
  const [preferencias, setPreferencias] = useState('');

  const restricciones = ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa', 'Sin mariscos', 'Sin frutos secos', 'Sin huevo', 'Sin cerdo', 'Bajo en sodio'];

  return (
    <div className="flex flex-col h-full bg-white flex-1 overflow-hidden">
      {/* Encabezado */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-teal-600"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path><path d="M6 17h12"></path></svg>
              Generador de Preparaciones
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Base de datos propia con 36 preparaciones · Sugerencia automática según distribución del plan</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 pt-4 bg-white border-b border-gray-100">
          <div className="text-gray-500 h-9 w-fit items-center justify-center rounded-xl p-0.75 flex bg-gray-100">
            <button 
              onClick={() => setActiveTab('generador')}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-xl px-4 py-1 text-sm font-medium transition-all gap-2 ${activeTab === 'generador' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
              Generador Automático
            </button>
            <button 
              onClick={() => setActiveTab('biblioteca')}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-xl px-4 py-1 text-sm font-medium transition-all gap-2 ${activeTab === 'biblioteca' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
              Mi Biblioteca (36)
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        {activeTab === 'generador' && (
          <div className="flex gap-0 h-full overflow-hidden">
            {/* Panel Lateral Izquierdo (Controles) */}
            <div className="w-96 border-r border-gray-200 overflow-y-auto bg-gray-50 shrink-0">
              <div className="p-6 space-y-6">
                
                {/* Título de Distribución */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Plan de distribución</h2>
                  <p className="text-xs text-gray-500">Ingresa las porciones asignadas por tiempo de comida</p>
                </div>

                {/* Tarjeta: Desayuno */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path><path d="M6 2v2"></path></svg>
                    <span className="text-sm font-semibold text-gray-800">Desayuno</span>
                    <span className="ml-auto text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">4 porciones</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <PorcionRow emoji="🌾" nombre="Cereales" color="text-yellow-800" cantidad={1} />
                    <PorcionRow emoji="🍎" nombre="Frutas" color="text-orange-800" cantidad={0} />
                    <PorcionRow emoji="🥦" nombre="Verduras" color="text-green-800" cantidad={0} />
                    <PorcionRow emoji="🥩" nombre="Proteínas" color="text-red-800" cantidad={2} />
                    <PorcionRow emoji="🥑" nombre="Grasas" color="text-blue-800" cantidad={0} />
                    <PorcionRow emoji="🥛" nombre="Lácteos" color="text-purple-800" cantidad={1} />
                  </div>
                </div>

                {/* Tarjeta: Colación AM */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                    <span className="text-sm font-semibold text-gray-800">Colación AM</span>
                    <span className="ml-auto text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">2 porciones</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <PorcionRow emoji="🌾" nombre="Cereales" color="text-yellow-800" cantidad={0} />
                    <PorcionRow emoji="🍎" nombre="Frutas" color="text-orange-800" cantidad={0} />
                    <PorcionRow emoji="🥦" nombre="Verduras" color="text-green-800" cantidad={0} />
                    <PorcionRow emoji="🥩" nombre="Proteínas" color="text-red-800" cantidad={1} />
                    <PorcionRow emoji="🥑" nombre="Grasas" color="text-blue-800" cantidad={0} />
                    <PorcionRow emoji="🥛" nombre="Lácteos" color="text-purple-800" cantidad={1} />
                  </div>
                </div>

                {/* Tarjeta: Almuerzo */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M7 21h10"></path><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"></path><path d="m13 12 4-4"></path><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"></path></svg>
                    <span className="text-sm font-semibold text-gray-800">Almuerzo</span>
                    <span className="ml-auto text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">6 porciones</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <PorcionRow emoji="🌾" nombre="Cereales" color="text-yellow-800" cantidad={1} />
                    <PorcionRow emoji="🍎" nombre="Frutas" color="text-orange-800" cantidad={0} />
                    <PorcionRow emoji="🥦" nombre="Verduras" color="text-green-800" cantidad={2} />
                    <PorcionRow emoji="🥩" nombre="Proteínas" color="text-red-800" cantidad={2} />
                    <PorcionRow emoji="🥑" nombre="Grasas" color="text-blue-800" cantidad={1} />
                    <PorcionRow emoji="🥛" nombre="Lácteos" color="text-purple-800" cantidad={0} />
                  </div>
                </div>

                <div className="bg-gray-200 h-px w-full my-4"></div>

                {/* Preferencias del Paciente */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path></svg>
                    Preferencias del paciente
                  </h2>
                  <div className="space-y-4">
                    
                    {/* Alimentos Rechazados */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Alimentos no preferidos / rechazados</label>
                      <input 
                        type="text" 
                        className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500" 
                        placeholder="Ej: pan, salmón, huevo (separados por coma)" 
                        value={alimentosRechazados}
                        onChange={(e) => setAlimentosRechazados(e.target.value)}
                      />
                      <p className="text-xs text-gray-400 mt-1">Las preparaciones con estos alimentos no aparecerán</p>
                    </div>

                    {/* Restricciones Tags */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Restricciones dietéticas</label>
                      <div className="flex flex-wrap gap-1.5">
                        {restricciones.map((res, index) => (
                          <button key={index} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferencias Extra */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">Preferencias adicionales (opcional)</label>
                      <input 
                        type="text" 
                        className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500" 
                        placeholder="Ej: prefiere preparaciones rápidas, sin gluten..." 
                        value={preferencias}
                        onChange={(e) => setPreferencias(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Botón Generar */}
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 py-2 w-full bg-teal-600 hover:bg-teal-700 gap-2 shadow-sm transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  Generar Sugerencias
                </button>
              </div>
            </div>

            {/* Panel Derecho (Empty State / Resultados) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Configura la distribución del plan</h3>
                <p className="text-sm text-gray-500 max-w-sm">Ingresa las porciones por grupo de alimento para cada tiempo de comida y el sistema sugerirá preparaciones compatibles automáticamente.</p>
                
                <div className="mt-8 grid grid-cols-3 gap-4 text-left max-w-lg">
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="text-2xl mb-2">1️⃣</div>
                    <p className="text-xs text-gray-600 font-medium">Define porciones por tiempo de comida</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="text-2xl mb-2">2️⃣</div>
                    <p className="text-xs text-gray-600 font-medium">Agrega preferencias del paciente</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="text-2xl mb-2">3️⃣</div>
                    <p className="text-xs text-gray-600 font-medium">Genera sugerencias automáticamente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Contenido Pestaña 2: Mi Biblioteca */}
        {activeTab === 'biblioteca' && (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {/* Buscador y Filtros */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-60">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input 
                  type="text" 
                  className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 bg-white pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500" 
                  placeholder="Buscar por nombre, ingrediente o etiqueta..." 
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-white shadow-sm text-gray-900">Todas</button>
                <button className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-gray-600 hover:text-gray-900">🥙 Saladas</button>
                <button className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-gray-600 hover:text-gray-900">🍯 Dulces</button>
              </div>
              <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-9">
                <option value="todos">Todos los tiempos</option>
                <option value="desayuno">Desayuno</option>
                <option value="almuerzo">Almuerzo</option>
              </select>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-9 px-4 bg-teal-600 hover:bg-teal-700 gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                Nueva Preparación
              </button>
            </div>

            {/* Tarjetas de Resumen (Métricas) */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Total preparaciones</p>
                <p className="text-2xl font-bold text-gray-900">36</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Saladas</p>
                <p className="text-2xl font-bold text-sky-700">20</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Dulces</p>
                <p className="text-2xl font-bold text-amber-700">16</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Grupos cubiertos</p>
                <p className="text-2xl font-bold text-teal-700">6</p>
              </div>
            </div>

            {/* Grid de Preparaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {BIBLIOTECA_RECETAS.map((receta) => (
                <div key={receta.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all p-4 flex flex-col">
                  {/* Título y Acciones */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${receta.color === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                          {receta.color === 'sky' ? '🥙 Salada' : '🍯 Dulce'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{receta.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors rounded"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg></button>
                    </div>
                  </div>

                  {/* Etiquetas de Ingredientes (Simulando colores por grupo) */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {receta.ingredientes.map((ing, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium 
                        ${ing.includes('Cereales') ? 'bg-yellow-50 text-yellow-700' : ''}
                        ${ing.includes('Proteínas') ? 'bg-red-50 text-red-700' : ''}
                        ${ing.includes('Verduras') ? 'bg-green-50 text-green-700' : ''}
                        ${ing.includes('Lácteos') ? 'bg-purple-50 text-purple-700' : ''}
                        ${ing.includes('Grasas') ? 'bg-blue-50 text-blue-700' : ''}
                        ${ing.includes('Frutas') ? 'bg-orange-50 text-orange-700' : ''}
                      `}>
                        {ing}
                      </span>
                    ))}
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 flex-1">{receta.desc}</p>

                  <button className="text-[11px] text-teal-600 hover:text-teal-700 mt-3 flex items-center gap-1 font-medium w-fit transition-colors">
                    Ver ingredientes
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};