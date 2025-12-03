import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { useAuth } from '../../context/AuthContext';

const Configuracion = () => {
  const { user, updateUser } = useAuth();

  // Admin data state
  const [adminData, setAdminData] = useState({
    nombre: user?.name?.split(' ')[0] || 'Admin',
    apellido: user?.name?.split(' ').slice(1).join(' ') || 'User',
    email: user?.email || 'admin@speedunlimited.com',
    telefono: '11-5555-0001'
  });

  // Company data state
  const [companyData, setCompanyData] = useState({
    nombreEmpresa: 'Speed Unlimited',
    cuit: '30-12345678-9',
    direccion: 'Av. Corrientes 1234, CABA, Argentina'
  });

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleAdminDataChange = (field, value) => {
    setAdminData({ ...adminData, [field]: value });
  };

  const handleCompanyDataChange = (field, value) => {
    setCompanyData({ ...companyData, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleSaveChanges = () => {
    // Update user context with new data
    const updatedName = `${adminData.nombre} ${adminData.apellido}`.trim();
    updateUser({
      name: updatedName,
      email: adminData.email
    });

    console.log('Guardando cambios:', {
      admin: adminData,
      company: companyData
    });

    alert('Cambios guardados exitosamente');
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    console.log('Cambiando contraseña...');
    alert('Contraseña cambiada exitosamente');

    // Reset password form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(false);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">⚙️ Configuración</h1>
        <p className="text-gray-600">
          Gestión de datos del administrador y configuración de la empresa
        </p>
      </div>

      {/* Admin Data Card */}
      <Card className="mb-4">
        <h2 className="text-2xl font-bold mb-4">👤 Datos del Administrador</h2>

        <div className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="nombre" className="font-bold mb-2 block">
                Nombre *
              </label>
              <InputText
                id="nombre"
                value={adminData.nombre}
                onChange={(e) => handleAdminDataChange('nombre', e.target.value)}
                placeholder="Ej: Juan"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="apellido" className="font-bold mb-2 block">
                Apellido *
              </label>
              <InputText
                id="apellido"
                value={adminData.apellido}
                onChange={(e) => handleAdminDataChange('apellido', e.target.value)}
                placeholder="Ej: Pérez"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="email" className="font-bold mb-2 block">
                Email *
              </label>
              <InputText
                id="email"
                type="email"
                value={adminData.email}
                onChange={(e) => handleAdminDataChange('email', e.target.value)}
                placeholder="Ej: admin@speedunlimited.com"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="telefono" className="font-bold mb-2 block">
                Teléfono *
              </label>
              <InputText
                id="telefono"
                value={adminData.telefono}
                onChange={(e) => handleAdminDataChange('telefono', e.target.value)}
                placeholder="Ej: 11-5555-1234"
              />
            </div>

            <div className="col-12 mb-3">
              <label className="font-bold mb-2 block">
                Contraseña
              </label>
              <Button
                label="Cambiar Contraseña"
                icon="pi pi-lock"
                className="p-button-outlined"
                onClick={() => setShowPasswordModal(true)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Company Configuration Card */}
      <Card className="mb-4">
        <h2 className="text-2xl font-bold mb-4">🏢 Configuración de la Empresa</h2>

        <div className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="nombreEmpresa" className="font-bold mb-2 block">
                Nombre de la Empresa *
              </label>
              <InputText
                id="nombreEmpresa"
                value={companyData.nombreEmpresa}
                onChange={(e) => handleCompanyDataChange('nombreEmpresa', e.target.value)}
                placeholder="Ej: Speed Unlimited"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="cuit" className="font-bold mb-2 block">
                CUIT *
              </label>
              <InputText
                id="cuit"
                value={companyData.cuit}
                onChange={(e) => handleCompanyDataChange('cuit', e.target.value)}
                placeholder="Ej: 30-12345678-9"
              />
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="direccion" className="font-bold mb-2 block">
                Dirección *
              </label>
              <InputTextarea
                id="direccion"
                value={companyData.direccion}
                onChange={(e) => handleCompanyDataChange('direccion', e.target.value)}
                rows={3}
                placeholder="Ej: Av. Corrientes 1234, CABA, Argentina"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Changes Button */}
      <div className="flex justify-content-end">
        <Button
          label="Guardar Cambios"
          icon="pi pi-check"
          className="p-button-danger"
          onClick={handleSaveChanges}
          disabled={
            !adminData.nombre ||
            !adminData.apellido ||
            !adminData.email ||
            !adminData.telefono ||
            !companyData.nombreEmpresa ||
            !companyData.cuit ||
            !companyData.direccion
          }
        />
      </div>

      {/* Password Change Modal */}
      <Dialog
        visible={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        header="Cambiar Contraseña"
        style={{ width: '500px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        <div className="p-fluid">
          <div className="mb-3">
            <label htmlFor="currentPassword" className="font-bold mb-2 block">
              Contraseña Actual *
            </label>
            <Password
              id="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Ingrese su contraseña actual"
              toggleMask
              feedback={false}
              className="w-full"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="newPassword" className="font-bold mb-2 block">
              Nueva Contraseña *
            </label>
            <Password
              id="newPassword"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Ingrese la nueva contraseña"
              toggleMask
              className="w-full"
            />
            <small className="text-gray-500">
              Mínimo 6 caracteres
            </small>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="font-bold mb-2 block">
              Confirmar Nueva Contraseña *
            </label>
            <Password
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirme la nueva contraseña"
              toggleMask
              feedback={false}
              className="w-full"
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowPasswordModal(false)}
            />
            <Button
              label="Cambiar Contraseña"
              icon="pi pi-check"
              onClick={handleSavePassword}
              disabled={
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Configuracion;
