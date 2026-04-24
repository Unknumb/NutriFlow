import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/index';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Si alguien entra a la raíz '/', lo mandamos al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Tu primera vista real conectada al Layout */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Aquí agregaremos las demás pantallas en el futuro */}
        {/* <Route path="/pacientes" element={<PacientesPage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
