import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAuth } from '../../context/AuthContext';
import { useZone } from '../../context/ZoneContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedZone, switchZone, getAllZones } = useZone();

  const zones = getAllZones();

  const menuItems = [
    { label: 'Dashboard', icon: 'pi pi-th-large', path: '/admin/dashboard' },
    { label: 'Clientes', icon: 'pi pi-users', path: '/admin/clientes' },
    { label: 'Productos', icon: 'pi pi-box', path: '/admin/productos' },
    { label: 'Pedidos', icon: 'pi pi-shopping-cart', path: '/admin/pedidos' },
    { label: 'Repartidores', icon: 'pi pi-truck', path: '/admin/repartidores' },
    { label: 'Rutas del Día', icon: 'pi pi-map', path: '/admin/rutas' },
    { label: 'Cobros', icon: 'pi pi-money-bill', path: '/admin/cobros' },
    { label: 'Gastos', icon: 'pi pi-wallet', path: '/admin/gastos' },
    { label: 'Facturación', icon: 'pi pi-file', path: '/admin/facturacion' },
    { label: 'Reportes', icon: 'pi pi-chart-line', path: '/admin/reportes' },
    { label: 'Configuración', icon: 'pi pi-cog', path: '/admin/config' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleZoneChange = (e) => {
    switchZone(e.value);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🚚 Speed Unlimited</h2>
          <p>Panel de Administración</p>
        </div>

        <div className="admin-menu">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`admin-menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar with Zone Context Visual */}
        <div
          className="admin-topbar"
          style={{
            backgroundColor: selectedZone?.name === 'Zona Sur' ? '#FFE5E5' : selectedZone?.name === 'San Telmo' ? '#FFF9E5' : '#FFFFFF',
            transition: 'background-color 0.3s ease'
          }}
        >
          <div className="admin-topbar-left">
            <h3 className="m-0">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Speed Unlimited'}
            </h3>
          </div>

          <div className="admin-topbar-right">
            {/* Zone Selector */}
            <Dropdown
              value={selectedZone?.id}
              options={zones.map(z => ({ label: z.name, value: z.id }))}
              onChange={handleZoneChange}
              placeholder="Seleccionar Zona"
              className="w-12rem"
            />

            {/* User Menu */}
            <div className="flex align-items-center gap-2">
              <span className="text-sm font-semibold">{user?.name}</span>
              <Button
                icon="pi pi-sign-out"
                rounded
                text
                severity="secondary"
                tooltip="Cerrar Sesión"
                tooltipOptions={{ position: 'bottom' }}
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
