import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { mockRepartidores } from '../../services/mockData';
import { ZONES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Repartidores = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [repartidores, setRepartidores] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState(null);

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

  const handleRowClick = (e) => {
    navigate(`/admin/repartidores/${e.data.id}`);
  };

  const handleNewRepartidor = () => {
    console.log('Nuevo repartidor');
  };

  const handleView = (repartidorId) => {
    navigate(`/admin/repartidores/${repartidorId}`);
  };

  const handleEdit = (repartidorId) => {
    console.log('Editar repartidor:', repartidorId);
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

  return (
    <div className="p-4">
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
    </div>
  );
};

export default Repartidores;
