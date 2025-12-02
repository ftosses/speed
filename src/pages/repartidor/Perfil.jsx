import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockRepartidores, mockOrders } from '../../services/mockData';
import { ZONES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

const RepartidorPerfil = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // Get repartidor data (mock)
  const repartidor = mockRepartidores.find(r => r.id === user.id) || mockRepartidores[0];

  const [formData, setFormData] = useState({
    name: repartidor.name,
    telefono: repartidor.phone,
    email: repartidor.email || user.email
  });

  const [editing, setEditing] = useState(false);

  const zone = Object.values(ZONES).find(z => z.id === repartidor.zone);

  // Get today's stats
  const myOrders = mockOrders.filter(o => o.repartidorId === repartidor.id);
  const todayOrders = myOrders.filter(o => {
    const orderDate = new Date(o.date).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const completedToday = todayOrders.filter(o => o.status === 'entregado').length;
  const pendingToday = todayOrders.filter(o => o.status === 'pendiente').length;
  const collectedToday = todayOrders
    .filter(o => o.paymentStatus === 'pagado')
    .reduce((sum, o) => sum + o.total, 0);

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email
    });
    setEditing(false);
    // Show success message (you could add a toast here)
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-3">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">👤 Mi Perfil</h1>
        <p className="text-gray-600">
          Información personal y estadísticas
        </p>
      </div>

      {/* Profile Info Card */}
      <Card className="mb-3">
        <div className="flex justify-content-between align-items-center mb-4">
          <h2 className="text-xl font-bold">Información Personal</h2>
          {!editing ? (
            <Button
              label="Editar"
              icon="pi pi-pencil"
              className="p-button-outlined"
              onClick={() => setEditing(true)}
            />
          ) : (
            <div className="flex gap-2">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-outlined p-button-secondary"
                onClick={() => {
                  setFormData({
                    name: repartidor.name,
                    telefono: repartidor.phone,
                    email: repartidor.email || user.email
                  });
                  setEditing(false);
                }}
              />
              <Button
                label="Guardar"
                icon="pi pi-check"
                onClick={handleSave}
              />
            </div>
          )}
        </div>

        <div className="grid">
          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Nombre Completo
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editing}
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="zona" className="block text-sm font-semibold mb-2">
              Zona Asignada
            </label>
            <Tag
              value={zone?.name}
              style={{ backgroundColor: zone?.color, padding: '0.5rem 1rem', fontSize: '1rem' }}
            />
          </div>

          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="telefono" className="block text-sm font-semibold mb-2">
              Teléfono
            </label>
            <InputText
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              disabled={!editing}
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-6 mb-3">
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Today's Stats Card */}
      <Card className="mb-3">
        <h2 className="text-xl font-bold mb-3">📊 Estadísticas de Hoy</h2>
        <div className="grid">
          <div className="col-12 md:col-4 mb-3">
            <Card className="bg-green-50 text-center">
              <div className="text-sm text-gray-600 mb-2">Entregas Completadas</div>
              <div className="text-4xl font-bold text-success">{completedToday}</div>
              <div className="text-sm text-gray-600">✅ entregados</div>
            </Card>
          </div>

          <div className="col-12 md:col-4 mb-3">
            <Card className="bg-blue-50 text-center">
              <div className="text-sm text-gray-600 mb-2">Total Cobrado</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(collectedToday)}</div>
              <div className="text-sm text-gray-600">💰 hoy</div>
            </Card>
          </div>

          <div className="col-12 md:col-4 mb-3">
            <Card className="bg-orange-50 text-center">
              <div className="text-sm text-gray-600 mb-2">Pendientes</div>
              <div className="text-4xl font-bold text-warning">{pendingToday}</div>
              <div className="text-sm text-gray-600">⏳ por entregar</div>
            </Card>
          </div>
        </div>
      </Card>

      {/* General Stats Card */}
      <Card className="mb-3">
        <h2 className="text-xl font-bold mb-3">📈 Estadísticas Generales</h2>
        <div className="grid">
          <div className="col-12 md:col-6 mb-2">
            <div className="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round">
              <span className="text-gray-600">Total de Entregas</span>
              <span className="text-xl font-bold">{repartidor.totalDeliveries || myOrders.length}</span>
            </div>
          </div>
          <div className="col-12 md:col-6 mb-2">
            <div className="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round">
              <span className="text-gray-600">Entregas Hoy</span>
              <span className="text-xl font-bold">{todayOrders.length}</span>
            </div>
          </div>
          <div className="col-12 md:col-6 mb-2">
            <div className="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round">
              <span className="text-gray-600">Tipo de Vehículo</span>
              <span className="text-xl font-bold">{repartidor.vehicleType || 'Moto'}</span>
            </div>
          </div>
          <div className="col-12 md:col-6 mb-2">
            <div className="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round">
              <span className="text-gray-600">Estado</span>
              <Tag value="✅ Activo" severity="success" />
            </div>
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Card>
        <div className="text-center">
          <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            className="p-button-danger w-full"
            onClick={handleLogout}
          />
        </div>
      </Card>
    </div>
  );
};

export default RepartidorPerfil;
