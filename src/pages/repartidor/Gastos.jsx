import React, { useState, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';
import { mockGastos } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';

const Gastos = () => {
  const { user } = useAuth();
  const [showNewGastoModal, setShowNewGastoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('hoy');

  // Form state for new gasto
  const [newGasto, setNewGasto] = useState({
    tipo: '',
    monto: 0,
    fecha: new Date(),
    descripcion: '',
    comprobante: null
  });

  // Get gastos for current repartidor
  const myGastos = useMemo(() => {
    return mockGastos.filter(g => g.repartidorId === user.id);
  }, [user.id]);

  // Filter gastos by period
  const filteredGastos = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return myGastos.filter(g => {
      const gastoDate = new Date(g.fecha);

      switch (filterPeriod) {
        case 'hoy':
          return gastoDate >= today;
        case 'semana':
          return gastoDate >= weekAgo;
        case 'mes':
          return gastoDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [myGastos, filterPeriod]);

  const tipoOptions = [
    { label: '⛽ Nafta', value: 'Nafta' },
    { label: '🛣️ Peaje', value: 'Peaje' },
    { label: '🍱 Vianda', value: 'Vianda' },
    { label: '💼 Viático', value: 'Viático' },
    { label: '📋 Otro', value: 'Otro' }
  ];

  const periodOptions = [
    { label: 'Hoy', value: 'hoy' },
    { label: 'Esta semana', value: 'semana' },
    { label: 'Este mes', value: 'mes' }
  ];

  const handleNewGasto = () => {
    setNewGasto({
      tipo: '',
      monto: 0,
      fecha: new Date(),
      descripcion: '',
      comprobante: null
    });
    setShowNewGastoModal(true);
  };

  const handleSaveGasto = () => {
    console.log('Guardando nuevo gasto:', newGasto);
    // Aquí iría la lógica para guardar en el backend
    alert('Gasto guardado exitosamente. Será revisado por el administrador.');
    setShowNewGastoModal(false);
  };

  const handleGastoClick = (gasto) => {
    setSelectedGasto(gasto);
    setShowDetailModal(true);
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'Nafta': '⛽',
      'Peaje': '🛣️',
      'Vianda': '🍱',
      'Viático': '💼',
      'Otro': '📋'
    };
    return icons[tipo] || '📋';
  };

  const getEstadoSeverity = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Rechazado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const totalGastos = filteredGastos.reduce((sum, g) => sum + g.monto, 0);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E31E24' }}>
          💰 Mis Gastos
        </h1>
        <p className="text-gray-600">
          Registrá tus gastos operativos para que sean aprobados
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-4">
        <div className="grid">
          <div className="col-6">
            <div className="text-sm text-gray-600">Total Gastos</div>
            <div className="text-2xl font-bold text-danger">
              {formatCurrency(totalGastos)}
            </div>
          </div>
          <div className="col-6">
            <div className="text-sm text-gray-600">Registros</div>
            <div className="text-2xl font-bold">
              {filteredGastos.length}
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex justify-content-between align-items-center mb-3 gap-2">
        <Dropdown
          value={filterPeriod}
          options={periodOptions}
          onChange={(e) => setFilterPeriod(e.value)}
          className="w-full md:w-auto"
        />
        <Button
          label="Cargar Gasto"
          icon="pi pi-plus"
          className="p-button-danger"
          onClick={handleNewGasto}
        />
      </div>

      {/* Gastos List */}
      <div className="gastos-list">
        {filteredGastos.length === 0 ? (
          <Card>
            <div className="text-center py-4">
              <i className="pi pi-inbox text-6xl text-gray-400 mb-3"></i>
              <h3>No hay gastos registrados</h3>
              <p className="text-gray-600 mb-3">Comenzá cargando tu primer gasto</p>
              <Button
                label="Cargar Gasto"
                icon="pi pi-plus"
                onClick={handleNewGasto}
              />
            </div>
          </Card>
        ) : (
          filteredGastos.map((gasto) => (
            <Card
              key={gasto.id}
              className="mb-3 cursor-pointer hover:shadow-4 transition-duration-200"
              onClick={() => handleGastoClick(gasto)}
            >
              <div className="flex align-items-start justify-content-between">
                <div className="flex-1">
                  <div className="flex align-items-center gap-2 mb-2">
                    <span className="text-2xl">{getTipoIcon(gasto.tipo)}</span>
                    <h3 className="text-xl font-bold m-0">{gasto.tipo}</h3>
                  </div>

                  <div className="flex align-items-center gap-2 mb-2">
                    <i className="pi pi-calendar text-gray-500"></i>
                    <span className="text-sm text-gray-600">
                      {new Date(gasto.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {gasto.descripcion}
                  </p>

                  <div className="flex align-items-center justify-content-between">
                    <span className="text-2xl font-bold" style={{ color: '#E31E24' }}>
                      {formatCurrency(gasto.monto)}
                    </span>
                    <Tag
                      value={gasto.estado}
                      severity={getEstadoSeverity(gasto.estado)}
                    />
                  </div>
                </div>
                <i className="pi pi-chevron-right text-2xl text-gray-400 ml-2"></i>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Gasto Modal */}
      <Dialog
        visible={showNewGastoModal}
        onHide={() => setShowNewGastoModal(false)}
        header="Cargar Nuevo Gasto"
        style={{ width: '90vw', maxWidth: '600px' }}
        modal
      >
        <div className="p-fluid">
          <div className="mb-3">
            <label htmlFor="tipo" className="font-bold mb-2 block">
              Tipo de Gasto *
            </label>
            <Dropdown
              id="tipo"
              value={newGasto.tipo}
              options={tipoOptions}
              onChange={(e) => setNewGasto({ ...newGasto, tipo: e.value })}
              placeholder="Seleccionar tipo"
              className="w-full"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="monto" className="font-bold mb-2 block">
              Monto *
            </label>
            <InputNumber
              id="monto"
              value={newGasto.monto}
              onValueChange={(e) => setNewGasto({ ...newGasto, monto: e.value })}
              mode="currency"
              currency="ARS"
              locale="es-AR"
              className="w-full"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="fecha" className="font-bold mb-2 block">
              Fecha *
            </label>
            <Calendar
              id="fecha"
              value={newGasto.fecha}
              onChange={(e) => setNewGasto({ ...newGasto, fecha: e.value })}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
              showTime
              hourFormat="24"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="descripcion" className="font-bold mb-2 block">
              Descripción *
            </label>
            <InputTextarea
              id="descripcion"
              value={newGasto.descripcion}
              onChange={(e) => setNewGasto({ ...newGasto, descripcion: e.target.value })}
              rows={3}
              placeholder="Ej: Carga de nafta en YPF Constitución"
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="font-bold mb-2 block">
              Foto del Comprobante (Opcional)
            </label>
            <FileUpload
              mode="basic"
              name="comprobante"
              accept="image/*"
              maxFileSize={5000000}
              chooseLabel="Seleccionar Foto"
              onSelect={(e) => setNewGasto({ ...newGasto, comprobante: e.files[0] })}
              auto={false}
            />
            <small className="text-gray-500">
              Tamaño máximo: 5MB. Formatos: JPG, PNG
            </small>
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowNewGastoModal(false)}
            />
            <Button
              label="Guardar Gasto"
              icon="pi pi-check"
              onClick={handleSaveGasto}
              disabled={!newGasto.tipo || !newGasto.monto || !newGasto.descripcion}
            />
          </div>
        </div>
      </Dialog>

      {/* Gasto Detail Modal */}
      <Dialog
        visible={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        header="Detalle del Gasto"
        style={{ width: '90vw', maxWidth: '600px' }}
        modal
      >
        {selectedGasto && (
          <div>
            <div className="mb-4">
              <div className="flex align-items-center gap-3 mb-3">
                <span className="text-4xl">{getTipoIcon(selectedGasto.tipo)}</span>
                <div>
                  <h3 className="text-2xl font-bold m-0">{selectedGasto.tipo}</h3>
                  <Tag
                    value={selectedGasto.estado}
                    severity={getEstadoSeverity(selectedGasto.estado)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid">
                <div className="col-12 mb-3">
                  <strong>Monto:</strong>
                  <div className="text-3xl font-bold mt-1" style={{ color: '#E31E24' }}>
                    {formatCurrency(selectedGasto.monto)}
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <strong>Fecha:</strong>
                  <div className="mt-1">
                    {new Date(selectedGasto.fecha).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <strong>Descripción:</strong>
                  <div className="mt-1">{selectedGasto.descripcion}</div>
                </div>

                {selectedGasto.comprobante && (
                  <div className="col-12 mb-3">
                    <strong>Comprobante:</strong>
                    <div className="mt-2">
                      <Button
                        label="Ver Comprobante"
                        icon="pi pi-image"
                        className="p-button-outlined"
                        onClick={() => console.log('Ver comprobante:', selectedGasto.comprobante)}
                      />
                    </div>
                  </div>
                )}

                {selectedGasto.observaciones && (
                  <div className="col-12 mb-3">
                    <strong>Observaciones del Admin:</strong>
                    <div className="mt-1 p-3 bg-yellow-50 border-round">
                      {selectedGasto.observaciones}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-content-end">
              <Button
                label="Cerrar"
                icon="pi pi-times"
                onClick={() => setShowDetailModal(false)}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Gastos;
