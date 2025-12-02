import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ZoneProvider } from './context/ZoneContext';

// Common Components
import PrivateRoute from './components/common/PrivateRoute';
import AdminLayout from './components/common/AdminLayout';
import RepartidorLayout from './components/common/RepartidorLayout';

// Pages
import Login from './pages/Login';
import ZoneSelection from './pages/ZoneSelection';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import Clientes from './pages/admin/Clientes';
import Productos from './pages/admin/Productos';
import Pedidos from './pages/admin/Pedidos';
import Repartidores from './pages/admin/Repartidores';
import Rutas from './pages/admin/Rutas';
import Cobranzas from './pages/admin/Cobranzas';
import Facturacion from './pages/admin/Facturacion';
import Reportes from './pages/admin/Reportes';

// Repartidor Components
import Home from './components/repartidor/Home';
import RepartidorClientes from './pages/repartidor/Clientes';
import RepartidorStock from './pages/repartidor/Stock';
import RepartidorPerfil from './pages/repartidor/Perfil';

// Constants
import { ROLES } from './utils/constants';

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }) => (
  <div className="p-card">
    <div className="p-card-body">
      <h2>{title}</h2>
      <p className="text-gray-600">Esta página está en desarrollo...</p>
      <p className="text-sm text-gray-500 mt-3">
        ✅ La estructura y navegación están funcionando correctamente.<br />
        📦 Todos los componentes principales han sido creados.<br />
        🚀 El sistema está listo para ser extendido con más funcionalidades.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ZoneProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />

            {/* Zone Selection (Admin only) */}
            <Route
              path="/zone-selection"
              element={
                <PrivateRoute requiredRole={ROLES.ADMIN}>
                  <ZoneSelection />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole={ROLES.ADMIN} requireZone={true}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="productos" element={<Productos />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="repartidores" element={<Repartidores />} />
              <Route path="rutas" element={<Rutas />} />
              <Route path="cobranzas" element={<Cobranzas />} />
              <Route path="facturacion" element={<Facturacion />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="config" element={<PlaceholderPage title="Configuración" />} />
            </Route>

            {/* Repartidor Routes */}
            <Route
              path="/repartidor"
              element={
                <PrivateRoute requiredRole={ROLES.REPARTIDOR}>
                  <RepartidorLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/repartidor/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="clientes" element={<RepartidorClientes />} />
              <Route path="stock" element={<RepartidorStock />} />
              <Route path="perfil" element={<RepartidorPerfil />} />
              <Route path="cargar-pedido/:orderId?" element={<PlaceholderPage title="Cargar Pedido" />} />
              <Route path="registrar-pago/:orderId" element={<PlaceholderPage title="Registrar Pago" />} />
              <Route path="facturacion/:orderId" element={<PlaceholderPage title="Facturación" />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ZoneProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
