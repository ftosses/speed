import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { mockRepartidores } from '../../services/mockData';
import { ZONES, VEHICLE_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Repartidores = () => {
  const { selectedZone } = useZone();
  const [repartidores, setRepartidores] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingRepartidor, setEditingRepartidor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    apellido: '',
    zone: '',
    vehicleType: '',
    phone: '',
    email: '',
    horario: '',
    active: true
  });

  useEffect(() => {
    let filteredRepartidores = mockRepartidores;

    if (selectedZone) {
      filteredRepartidores = filteredRepartidores.filter(r => r.zone === selectedZone.id);
    }

    if (selectedZoneFilter) {
      filteredRepartidores = filteredRepartidores.filter(r => r.zone === selectedZoneFilter);
    }

    setRepartidores(filteredRepartidores);
  }, [selectedZone, selectedZoneFilter]);

  const vehicleOptions = [
    { label: '🏍️ Moto', value: VEHICLE_TYPES.MOTO },
    { label: '🚗 Auto', value: VEHICLE_TYPES.AUTO },
    { label: '🚐 Camioneta', value: VEHICLE_TYPES.CAMIONETA }
  ];

  const estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  const handleRowClick = (e) => {
    handleEdit(e.data);
  };

  const handleNewRepartidor = () => {
    setFormData({
      name: '',
      apellido: '',
      zone: '',
      vehicleType: '',
      phone: '',
      email: '',
      horario: '8:00 - 18:00',
      active: true
    });
    setEditingRepartidor(null);
    setShowNewModal(true);
  };

  const handleEdit = (repartidor) => {
    setEditingRepartidor(repartidor);
    setFormData({
      name: repartidor.name.split(' ')[0] || '',
      apellido: repartidor.name.split(' ').slice(1).join(' ') || '',
      zone: repartidor.zone,
      vehicleType: repartidor.vehicleType,
      phone: repartidor.phone,
      email: repartidor.email || '',
      horario: '8:00 - 18:00',
      active: repartidor.active !== false
    });
    setShowEditModal(true);
  };

  const handleSave = () => {
    console.log('Guardando repartidor:', formData);
    // Aquí iría la lógica para guardar en el backend
    alert('Repartidor guardado exitosamente');
    setShowEditModal(false);
    setShowNewModal(false);
  };

  const handleDelete = (repartidor) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar al repartidor ${repartidor.name}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => {
        console.log('Eliminando repartidor:', repartidor.id);
        alert(`Repartidor ${repartidor.name} eliminado`);
      }
    });
  };

  // Column templates
  const nameBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <div className="flex align-items-center justify-content-center bg-gray-100"
             style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
          <i className="pi pi-user text-xl"></i>
        </div>
        <div>
          <div className="font-semibold">{rowData.name}</div>
          <div className="text-sm text-gray-600">{rowData.vehicleType}</div>
        </div>
      </div>
    );
  };

  const zoneBodyTemplate = (rowData) => {
    const zone = Object.values(ZONES).find(z => z.id === rowData.zone);
    return (
      <Tag
        value={zone?.name}
        style={{ backgroundColor: zone?.color }}
      />
    );
  };

  const phoneBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-phone"></i>
        <span>{rowData.phone}</span>
      </div>
    );
  };

  const entregasBodyTemplate = (rowData) => {
    const percentage = (rowData.deliveriesToday / rowData.totalDeliveries) * 100;
    return (
      <div>
        <div className="font-semibold">
          {rowData.deliveriesToday}/{rowData.totalDeliveries}
        </div>
        <div className="text-sm text-gray-600">
          {percentage.toFixed(0)}% completado
        </div>
      </div>
    );
  };

  const collectedBodyTemplate = (rowData) => {
    return (
      <span className="font-semibold text-success">
        {formatCurrency(rowData.collectedToday)}
      </span>
    );
  };

  const estadoBodyTemplate = (rowData) => {
    return (
      <Tag
        value="✅ Activo"
        severity="success"
      />
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="action-button"
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(rowData);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="action-button"
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(rowData);
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar repartidor..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={selectedZoneFilter}
          onChange={(e) => setSelectedZoneFilter(e.value)}
          options={[
            { label: 'Todas las zonas', value: null },
            ...Object.values(ZONES).map(z => ({ label: z.name, value: z.id }))
          ]}
          placeholder="Filtrar por zona"
          showClear={!!selectedZoneFilter}
        />
      </div>
      <Button
        label="Nuevo Repartidor"
        icon="pi pi-user-plus"
        onClick={handleNewRepartidor}
        className="p-button-danger"
      />
    </div>
  );

  const renderEditModal = (isNew = false) => (
    <Dialog
      visible={isNew ? showNewModal : showEditModal}
      onHide={() => isNew ? setShowNewModal(false) : setShowEditModal(false)}
      header={isNew ? "Nuevo Repartidor" : "Editar Repartidor"}
      style={{ width: '700px' }}
      breakpoints={{ '960px': '75vw', '640px': '95vw' }}
    >
      <div className="p-fluid">
        <div className="grid">
          <div className="col-6 mb-3">
            <label htmlFor="name" className="font-bold mb-2 block">
              Nombre *
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Juan"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="apellido" className="font-bold mb-2 block">
              Apellido *
            </label>
            <InputText
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              placeholder="Ej: Pérez"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="zone" className="font-bold mb-2 block">
              Zona *
            </label>
            <Dropdown
              id="zone"
              value={formData.zone}
              options={Object.values(ZONES).map(z => ({ label: z.name, value: z.id }))}
              onChange={(e) => setFormData({ ...formData, zone: e.value })}
              placeholder="Seleccionar zona"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="vehicleType" className="font-bold mb-2 block">
              Vehículo *
            </label>
            <Dropdown
              id="vehicleType"
              value={formData.vehicleType}
              options={vehicleOptions}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.value })}
              placeholder="Seleccionar vehículo"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="phone" className="font-bold mb-2 block">
              Teléfono *
            </label>
            <InputText
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej: 11-5555-1234"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="email" className="font-bold mb-2 block">
              Email
            </label>
            <InputText
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: juan@speedunlimited.com"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="horario" className="font-bold mb-2 block">
              Horario
            </label>
            <InputText
              id="horario"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              placeholder="Ej: 8:00 - 18:00"
            />
          </div>

          <div className="col-6 mb-3">
            <label htmlFor="active" className="font-bold mb-2 block">
              Estado *
            </label>
            <Dropdown
              id="active"
              value={formData.active}
              options={estadoOptions}
              onChange={(e) => setFormData({ ...formData, active: e.value })}
            />
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => isNew ? setShowNewModal(false) : setShowEditModal(false)}
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            onClick={handleSave}
            disabled={!formData.name || !formData.zone || !formData.vehicleType || !formData.phone}
          />
        </div>
      </div>
    </Dialog>
  );

  return (
    <div className="p-4">
      <ConfirmDialog />

      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">👤 Repartidores</h1>
        <p className="text-gray-600">
          Gestión de repartidores y rutas de entrega
        </p>
      </div>

      <DataTable
        value={repartidores}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron repartidores"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="name"
          header="Nombre"
          body={nameBodyTemplate}
          sortable
          style={{ minWidth: '200px' }}
        />
        <Column
          field="zone"
          header="Zona"
          body={zoneBodyTemplate}
          sortable
          style={{ minWidth: '130px' }}
        />
        <Column
          field="phone"
          header="Teléfono"
          body={phoneBodyTemplate}
          style={{ minWidth: '150px' }}
        />
        <Column
          field="deliveriesToday"
          header="Entregas Hoy"
          body={entregasBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="collectedToday"
          header="Cobrado Hoy"
          body={collectedBodyTemplate}
          sortable
          style={{ minWidth: '140px' }}
        />
        <Column
          header="Estado"
          body={estadoBodyTemplate}
          style={{ minWidth: '120px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '120px' }}
        />
      </DataTable>

      {renderEditModal(false)}
      {renderEditModal(true)}
    </div>
  );
};

export default Repartidores;
