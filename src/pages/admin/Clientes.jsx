import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { mockClients } from '../../services/mockData';
import { ZONES, PRICE_LIST_LABELS, IVA_CONDITION_LABELS, IVA_CONDITIONS, CLIENT_TYPES, CLIENT_TYPE_LABELS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Clientes = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [clients, setClients] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [debtFilter, setDebtFilter] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [newClientData, setNewClientData] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    zone: '',
    priceList: ''
  });

  useEffect(() => {
    // Filter clients by selected zone and other filters
    let filteredClients = mockClients;

    if (selectedZone) {
      filteredClients = filteredClients.filter(c => c.zone === selectedZone.id);
    }

    if (selectedZoneFilter) {
      filteredClients = filteredClients.filter(c => c.zone === selectedZoneFilter);
    }

    // Filter by payment status (estadoPago)
    if (paymentStatusFilter) {
      filteredClients = filteredClients.filter(c => c.estadoPago === paymentStatusFilter);
    }

    // Filter by category (type)
    if (categoryFilter) {
      filteredClients = filteredClients.filter(c => c.type === categoryFilter);
    }

    // Filter by debt
    if (debtFilter === 'with_debt') {
      filteredClients = filteredClients.filter(c => c.deudaTotal > 0);
    } else if (debtFilter === 'no_debt') {
      filteredClients = filteredClients.filter(c => c.deudaTotal === 0);
    }
    // If debtFilter is null or 'all', show all

    setClients(filteredClients);
  }, [selectedZone, selectedZoneFilter, paymentStatusFilter, categoryFilter, debtFilter]);

  const handleRowClick = (e) => {
    setSelectedCliente(e.data);
    setShowEditModal(true);
    setEditFormData({
      name: e.data.name,
      fantasyName: e.data.fantasyName || e.data.name,
      razonSocial: e.data.razonSocial || '',
      cuit: e.data.cuit || '',
      ivaCondition: e.data.ivaCondition || '',
      email: e.data.email || '',
      phone: e.data.phone || '',
      address: e.data.address || '',
      zone: e.data.zone || '',
      priceList: e.data.priceList || ''
    });
  };

  const handleNewClient = () => {
    setNewClientData({
      name: '',
      type: '',
      address: '',
      phone: '',
      email: '',
      zone: '',
      priceList: ''
    });
    setShowNewClientModal(true);
  };

  const handleSaveNewClient = () => {
    console.log('Guardando nuevo cliente:', newClientData);
    alert('Cliente creado exitosamente');
    setShowNewClientModal(false);
  };

  const handleView = (clientId) => {
    navigate(`/admin/clientes/${clientId}`);
  };

  const handleEdit = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedCliente(client);
      setShowEditModal(true);
      setEditFormData({
        name: client.name,
        fantasyName: client.fantasyName || client.name,
        razonSocial: client.razonSocial || '',
        cuit: client.cuit || '',
        ivaCondition: client.ivaCondition || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        zone: client.zone || '',
        priceList: client.priceList || ''
      });
    }
  };

  const handleSave = () => {
    // TODO: Save changes to backend
    console.log('Guardar cambios:', editFormData);
    setShowEditModal(false);
    setSelectedCliente(null);
  };

  const handleDelete = (clientId) => {
    // TODO: Confirm and delete
    console.log('Eliminar cliente:', clientId);
  };

  // Column templates
  const nameBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.name}</div>
        <div className="text-sm text-gray-600">{rowData.type}</div>
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

  const addressBodyTemplate = (rowData) => {
    return (
      <div className="text-sm">{rowData.address}</div>
    );
  };

  const saldoBodyTemplate = (rowData) => {
    const isPositive = rowData.currentBalance >= 0;
    return (
      <span className={isPositive ? 'text-success font-semibold' : 'text-danger font-semibold'}>
        {formatCurrency(Math.abs(rowData.currentBalance))}
      </span>
    );
  };

  const estadoBodyTemplate = (rowData) => {
    const isPositive = rowData.currentBalance >= 0;
    return (
      <Tag
        value={isPositive ? 'Al día' : 'Debe'}
        severity={isPositive ? 'success' : 'danger'}
      />
    );
  };

  const priceListBodyTemplate = (rowData) => {
    return (
      <span className="text-sm">{PRICE_LIST_LABELS[rowData.priceList]}</span>
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #F9F9F9',
            color: '#E31E24',
            borderRadius: '8px',
            minHeight: '40px',
            minWidth: '40px'
          }}
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(rowData.id);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #F9F9F9',
            color: '#E31E24',
            borderRadius: '8px',
            minHeight: '40px',
            minWidth: '40px'
          }}
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(rowData.id);
          }}
        />
      </div>
    );
  };

  // Filter options
  const paymentStatusOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Pagado', value: 'Pagado' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Deudor', value: 'Deudor' }
  ];

  const categoryOptions = [
    { label: 'Todas las categorías', value: null },
    ...Object.entries(CLIENT_TYPE_LABELS).map(([key, label]) => ({
      label,
      value: key
    }))
  ];

  const debtOptions = [
    { label: 'Todos', value: null },
    { label: 'Tiene deuda', value: 'with_debt' },
    { label: 'Sin deuda', value: 'no_debt' }
  ];

  const header = (
    <div className="flex flex-column gap-3">
      <div className="flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="flex gap-2 align-items-center flex-wrap flex-1">
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
            className="filter-compact filter-search"
          />
          <Dropdown
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.value)}
            options={paymentStatusOptions}
            placeholder="Estado"
            showClear={!!paymentStatusFilter}
            className="filter-compact"
          />
          <Dropdown
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.value)}
            options={categoryOptions}
            placeholder="Categoría"
            showClear={!!categoryFilter}
            className="filter-compact"
          />
          <Dropdown
            value={debtFilter}
            onChange={(e) => setDebtFilter(e.value)}
            options={debtOptions}
            placeholder="Deuda"
            showClear={!!debtFilter}
            className="filter-compact"
          />
          {!selectedZone && (
            <Dropdown
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.value)}
              options={[
                { label: 'Todas las zonas', value: null },
                ...Object.values(ZONES).map(z => ({ label: z.name, value: z.id }))
              ]}
              placeholder="Zona"
              showClear={!!selectedZoneFilter}
              className="filter-compact"
            />
          )}
        </div>
        <Button
          label="Nuevo Cliente"
          icon="pi pi-plus"
          onClick={handleNewClient}
          className="p-button-danger"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Clientes</h1>
        <p className="text-gray-600">
          Gestión de clientes y cuentas corrientes
        </p>
      </div>

      <DataTable
        value={clients}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron clientes"
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
        {!selectedZoneFilter && !selectedZone && (
          <Column
            field="zone"
            header="Zona"
            body={zoneBodyTemplate}
            sortable
            style={{ minWidth: '120px' }}
          />
        )}
        <Column
          field="address"
          header="Dirección"
          body={addressBodyTemplate}
          style={{ minWidth: '250px' }}
        />
        <Column
          field="priceList"
          header="Lista de Precios"
          body={priceListBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="currentBalance"
          header="Saldo"
          body={saldoBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="currentBalance"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
          style={{ minWidth: '100px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '150px' }}
        />
      </DataTable>

      {/* Edit Modal */}
      <Dialog
        visible={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedCliente(null);
        }}
        header="✏️ Editar Cliente"
        style={{ width: '700px' }}
        modal
        dismissableMask
      >
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">📋 Datos Básicos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Nombre de fantasía *</label>
              <InputText
                value={editFormData.fantasyName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, fantasyName: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Razón social</label>
              <InputText
                value={editFormData.razonSocial || ''}
                onChange={(e) => setEditFormData({ ...editFormData, razonSocial: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">CUIT</label>
              <InputText
                value={editFormData.cuit || ''}
                onChange={(e) => setEditFormData({ ...editFormData, cuit: e.target.value })}
                placeholder="XX-XXXXXXXX-X"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Categoría IVA</label>
              <Dropdown
                value={editFormData.ivaCondition || ''}
                onChange={(e) => setEditFormData({ ...editFormData, ivaCondition: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  ...Object.entries(IVA_CONDITION_LABELS).map(([key, label]) => ({
                    label,
                    value: key
                  }))
                ]}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Email</label>
              <InputText
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                type="email"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Teléfono</label>
              <InputText
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                type="tel"
                className="w-full"
              />
            </div>
            <div className="col-12">
              <label className="block text-sm font-semibold mb-2">Dirección</label>
              <div className="flex gap-2 align-items-center">
                <InputText
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="flex-1"
                />
                {editFormData.address && (
                  <Button
                    icon="pi pi-map-marker"
                    label="Ver en Maps"
                    className="p-button-sm p-button-outlined"
                    onClick={() => {
                      const encodedAddress = encodeURIComponent(editFormData.address);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                    }}
                    tooltip="Abrir en Google Maps"
                    tooltipOptions={{ position: 'top' }}
                  />
                )}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-3 mt-4">💰 Datos Comerciales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Zona/Ruta</label>
              <Dropdown
                value={editFormData.zone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, zone: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  ...Object.values(ZONES).map(z => ({ label: z.name, value: z.id }))
                ]}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-semibold mb-2">Lista de precios</label>
              <Dropdown
                value={editFormData.priceList || ''}
                onChange={(e) => setEditFormData({ ...editFormData, priceList: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  ...Object.entries(PRICE_LIST_LABELS).map(([key, label]) => ({
                    label,
                    value: key
                  }))
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancelar"
              className="p-button-secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedCliente(null);
              }}
            />
            <Button
              label="Guardar Cambios"
              className="p-button-danger"
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>

      {/* New Client Modal */}
      <Dialog
        visible={showNewClientModal}
        onHide={() => setShowNewClientModal(false)}
        header="Nuevo Cliente"
        style={{ width: '700px' }}
        modal
        dismissableMask
      >
        <div className="p-4">
          <div className="grid">
            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Nombre *</label>
              <InputText
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                className="w-full"
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Tipo *</label>
              <Dropdown
                value={newClientData.type}
                onChange={(e) => setNewClientData({ ...newClientData, type: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  { label: 'Bar', value: 'Bar' },
                  { label: 'Restaurant', value: 'Restaurant' },
                  { label: 'Kiosco', value: 'Kiosco' },
                  { label: 'Minimercado', value: 'Minimercado' },
                  { label: 'Evento', value: 'Evento' },
                  { label: 'Boliche', value: 'Boliche' }
                ]}
                className="w-full"
                placeholder="Seleccionar tipo"
              />
            </div>

            <div className="col-12 mb-3">
              <label className="block text-sm font-semibold mb-2">Dirección *</label>
              <InputText
                value={newClientData.address}
                onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                className="w-full"
                placeholder="Dirección completa"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Teléfono</label>
              <InputText
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                className="w-full"
                type="tel"
                placeholder="11-XXXX-XXXX"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Email</label>
              <InputText
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                className="w-full"
                type="email"
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Zona *</label>
              <Dropdown
                value={newClientData.zone}
                onChange={(e) => setNewClientData({ ...newClientData, zone: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  ...Object.values(ZONES).map(z => ({ label: z.name, value: z.id }))
                ]}
                className="w-full"
                placeholder="Seleccionar zona"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Lista de Precios *</label>
              <Dropdown
                value={newClientData.priceList}
                onChange={(e) => setNewClientData({ ...newClientData, priceList: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  ...Object.entries(PRICE_LIST_LABELS).map(([key, label]) => ({
                    label,
                    value: key
                  }))
                ]}
                className="w-full"
                placeholder="Seleccionar lista"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancelar"
              className="p-button-secondary"
              onClick={() => setShowNewClientModal(false)}
            />
            <Button
              label="Guardar Cliente"
              className="p-button-danger"
              onClick={handleSaveNewClient}
              disabled={!newClientData.name || !newClientData.type || !newClientData.address || !newClientData.zone || !newClientData.priceList}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Clientes;
