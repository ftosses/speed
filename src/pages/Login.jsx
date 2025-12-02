import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ROLES.ADMIN
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { label: 'Administrador', value: ROLES.ADMIN, icon: 'pi pi-user-edit' },
    { label: 'Repartidor', value: ROLES.REPARTIDOR, icon: 'pi pi-truck' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        // Redirect based on role
        switch (formData.role) {
          case ROLES.ADMIN:
            navigate('/zone-selection');
            break;
          case ROLES.REPARTIDOR:
            navigate('/repartidor/home');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const roleItemTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <i className={`${option.icon} mr-2`}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <h1>🚚 Speed Unlimited</h1>
          <p>Sistema de Gestión de Distribución</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <Message severity="error" text={error} className="w-full mb-3" />
          )}

          <div className="p-fluid">
            <div className="mb-3">
              <label htmlFor="role" className="block mb-2 font-semibold">
                Rol
              </label>
              <Dropdown
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.value })}
                options={roles}
                optionLabel="label"
                itemTemplate={roleItemTemplate}
                placeholder="Seleccione un rol"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="block mb-2 font-semibold">
                Email / Usuario
              </label>
              <InputText
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@speedunlimited.com"
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 font-semibold">
                Contraseña
              </label>
              <Password
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                feedback={false}
                toggleMask
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              label="Ingresar"
              icon="pi pi-sign-in"
              loading={loading}
              className="w-full"
            />
          </div>
        </form>

        <div className="mt-4 text-center">
          <small className="text-gray-600">
            Demo: use cualquier email y contraseña
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
