import React, { useState } from 'react';

// MOCK DATA: Exactamente los mismos datos e ingredientes de tu diseño en Figma
const PREPARACIONES_FIGMA = [
  {
    id: 1,
    nombre: 'Avena con manzana y almendras',
    tipo: 'Desayuno',
    calorias: 320,
    tags: [
      { nombre: 'Avena', color: 'bg-yellow-100 text-yellow-800' },
      { nombre: 'Manzana', color: 'bg-orange-100 text-orange-800' },
      { nombre: 'Almendras', color: 'bg-blue-100 text-blue-800' },
      { nombre: 'Leche', color: 'bg-purple-100 text-purple-800' },
    ]
  },
  {
    id: 2,
    nombre: 'Ensalada de pollo con quinoa',
    tipo: 'Almuerzo',
    calorias: 450,
    tags: [
      { nombre: 'Pollo', color: 'bg-red-100 text-red-800' },
      { nombre: 'Quinoa', color: 'bg-yellow-100 text-yellow-800' },
      { nombre: 'Lechuga', color: 'bg-green-100 text-green-800' },
      { nombre: 'Tomate', color: 'bg-green-100 text-green-800' },
      { nombre: 'Aceite oliva', color: 'bg-blue-100 text-blue-800' },
    ]
  },
  {
    id: 3,
    nombre: 'Yogurt con frutos rojos',
    tipo: 'Colación',
    calorias: 240,
    tags: [
      { nombre: 'Yogurt', color: 'bg-purple-100 text-purple-800' },
      { nombre: 'Berries', color: 'bg-orange-100 text-orange-800' },
      { nombre: 'Granola', color: 'bg-yellow-100 text-yellow-800' },
    ]
  },
  {
    id: 4,
    nombre: 'Salmón con arroz y brócoli',
    tipo: 'Cena',
    calorias: 520,
    tags: [
      { nombre: 'Salmón', color: 'bg-red-100 text-red-800' },
      { nombre: 'Arroz', color: 'bg-yellow-100 text-yellow-800' },
      { nombre: 'Brócoli', color: 'bg-green-100 text-green-800' },
      { nombre: 'Aceite', color: 'bg-blue-100 text-blue-800' },
    ]
  },
  {
    id: 5,
    nombre: 'Tostadas con palta y huevo',
    tipo: 'Desayuno',
    calorias: 380,
    tags: [
      { nombre: 'Pan integral', color: 'bg-yellow-100 text-yellow-800' },
      { nombre: 'Palta', color: 'bg-blue-100 text-blue-800' },
      { nombre: 'Huevo', color: 'bg-red-100 text-red-800' },
    ]
  },
  {
    id: 6,
    nombre: 'Wrap de pollo y vegetales',
    tipo: 'Almuerzo',
    calorias: 410,
    tags: [
      { nombre: 'Tortilla', color: 'bg-yellow-100 text-yellow-800' },
      { nombre: 'Pollo', color: 'bg-red-100 text-red-800' },
      { nombre: 'Lechuga', color: 'bg-green-100 text-green-800' },
      { nombre: 'Pimiento', color: 'bg-green-100 text-green-800' },
    ]
  }
];

export const BibliotecaPreparaciones: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Biblioteca de Preparaciones</h1>
        <p className="text-gray-600 mt-1">Gestiona y utiliza preparaciones predefinidas</p>
      </div>

      {/* Barra de Controles y Botones */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input 
            type="text"
            className="flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-colors outline-none focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200 pl-10" 
            placeholder="Buscar preparaciones..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-white text-gray-900 hover:bg-gray-100 h-9 px-4 py-2 gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-4 h-4">
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
          Nueva Preparación
        </button>
        
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors text-white h-9 px-4 py-2 gap-2 bg-teal-600 hover:bg-teal-700 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 h-4">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            <path d="M20 3v4"></path>
            <path d="M22 5h-4"></path>
            <path d="M4 17v2"></path>
            <path d="M5 18H3"></path>
          </svg>
          Generar Menú Automático
        </button>
      </div>

      {/* Grid de Tarjetas (Figma Design Exacto) */}
      <div className="grid grid-cols-3 gap-6">
        {PREPARACIONES_FIGMA.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).map((prep) => (
          <div key={prep.id} className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            
            {/* Imagen de la Preparación */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <div className="inline-block bg-gray-100 text-center align-middle w-full h-full object-cover">
                <div className="flex items-center justify-center w-full h-full">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==" alt="Placeholder" />
                </div>
              </div>
              
              {/* Badge Calorías en Imagen */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-white/90 backdrop-blur text-gray-700 shadow-sm">
                  {prep.calorias} kcal
                </span>
              </div>
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="p-4 pb-6">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">{prep.nombre}</h3>
                <p className="text-xs text-gray-500">{prep.tipo}</p>
              </div>
              
              {/* Etiquetas / Ingredientes */}
              <div className="flex flex-wrap gap-1.5">
                {prep.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium border-0 ${tag.color}`}
                  >
                    {tag.nombre}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};