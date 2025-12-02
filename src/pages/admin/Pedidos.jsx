import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { mockOrders } from '../../services/mockData';
import { ZONES, ORDER_STATUS, ORDER_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Pedidos = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [orders, setOrders] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    let filteredOrders = mockOrders;

    if (selectedZone) {
      filteredOrders = filteredOrders.filter(o => o.zone === selectedZone.id);
    }

    if (selectedStatus) {
      filteredOrders = filteredOrders.filter(o => o.status === selectedStatus);
    }

    setOrders(filteredOrders);
  }, [selectedZone, selectedStatus]);

  const handleRowClick = (e) => {
    navigate(`/admin/pedidos/${e.data.id}`);
  };

  const handleNewOrder = () => {
    console.log('Cargar nuevo pedido');
  };

  const handleView = (orderId) => {
    navigate(`/admin/pedidos/${orderId}`);
  };

  const handleEdit = (orderId) => {
    console.log('Editar pedido:', orderId);
  };

  const handleDelete = (orderId) => {
    console.log('Eliminar pedido:', orderId);
  };

  // Column templates
  const idBodyTemplate = (rowData) => {
    return <span className="font-mono font-semibold">#{rowData.id}</span>;
  };

  const fechaBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{formatDate(rowData.date)}</div>
        <div className="text-sm text-gray-600">
          {new Date(rowData.date).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  };

  const clienteBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.clientName}</div>
        <div className="text-sm text-gray-600">{rowData.clientAddress}</div>
      </div>
    );
  };

  const repartidorBodyTemplate = (rowData) => {
    return rowData.repartidorName || '-';
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

  const totalBodyTemplate = (rowData) => {
    return <span className="font-semibold">{formatCurrency(rowData.total)}</span>;
  };

  const estadoBodyTemplate = (rowData) => {
    const statusConfig = {
      [ORDER_STATUS.PENDIENTE]: { severity: 'secondary', icon: '⏳' },
      [ORDER_STATUS.EN_RUTA]: { severity: 'info', icon: '🚚' },
      [ORDER_STATUS.ENTREGADO]: { severity: 'success', icon: '✅' },
      [ORDER_STATUS.DEVOLUCION_PARCIAL]: { severity: 'warning', icon: '⚠️' },
      [ORDER_STATUS.CANCELADO]: { severity: 'danger', icon: '❌' },
      [ORDER_STATUS.CONSIGNACION]: { severity: 'info', icon: '📦' }
    };

    const config = statusConfig[rowData.status] || { severity: 'secondary', icon: '' };

    return (
      <Tag
        value={`${config.icon} ${ORDER_STATUS_LABELS[rowData.status]}`}
        severity={config.severity}
      />
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="action-button"
          tooltip="Ver"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleView(rowData.id);
          }}
        />
        <Button
          icon="pi pi-pencil"
          className="action-button"
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(rowData.id);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="action-button"
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

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar pedido..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.value)}
          options={[
            { label: 'Todos los estados', value: null },
            ...Object.keys(ORDER_STATUS).map(key => ({
              label: ORDER_STATUS_LABELS[ORDER_STATUS[key]],
              value: ORDER_STATUS[key]
            }))
          ]}
          placeholder="Filtrar por estado"
          showClear={!!selectedStatus}
        />
      </div>
      <Button
        label="Cargar Pedido"
        icon="pi pi-box"
        onClick={handleNewOrder}
        className="p-button-danger"
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">📦 Pedidos</h1>
        <p className="text-gray-600">
          Gestión de pedidos y entregas
        </p>
      </div>

      <DataTable
        value={orders}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron pedidos"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="id"
          header="ID"
          body={idBodyTemplate}
          sortable
          style={{ minWidth: '80px' }}
        />
        <Column
          field="date"
          header="Fecha"
          body={fechaBodyTemplate}
          sortable
          style={{ minWidth: '140px' }}
        />
        <Column
          field="clientName"
          header="Cliente"
          body={clienteBodyTemplate}
          sortable
          style={{ minWidth: '220px' }}
        />
        <Column
          field="repartidorName"
          header="Repartidor"
          body={repartidorBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="zone"
          header="Zona"
          body={zoneBodyTemplate}
          sortable
          style={{ minWidth: '130px' }}
        />
        <Column
          field="total"
          header="Total"
          body={totalBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="status"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '150px' }}
        />
      </DataTable>
    </div>
  );
};

export default Pedidos;
