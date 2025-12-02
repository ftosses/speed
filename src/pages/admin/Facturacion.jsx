import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { mockFacturas } from '../../services/mockData';
import { INVOICE_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Facturacion = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [facturas, setFacturas] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState(null);

  useEffect(() => {
    let filteredFacturas = mockFacturas;

    if (selectedZone) {
      filteredFacturas = filteredFacturas.filter(f => f.zone === selectedZone.id);
    }

    if (selectedTipo) {
      filteredFacturas = filteredFacturas.filter(f => f.tipo === selectedTipo);
    }

    if (selectedEstado) {
      filteredFacturas = filteredFacturas.filter(f => f.estado === selectedEstado);
    }

    setFacturas(filteredFacturas);
  }, [selectedZone, selectedTipo, selectedEstado]);

  const handleRowClick = (e) => {
    navigate(`/admin/facturacion/${e.data.id}`);
  };

  const handleNewFactura = () => {
    console.log('Nueva factura manual');
  };

  const handleView = (facturaId) => {
    navigate(`/admin/facturacion/${facturaId}`);
  };

  const handleDownload = (facturaId) => {
    console.log('Descargar PDF:', facturaId);
  };

  const handleAnular = (facturaId) => {
    console.log('Anular factura:', facturaId);
  };

  // Column templates
  const numeroBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-mono font-semibold">{rowData.numero}</div>
        {rowData.tipo === 'REMITO' && (
          <Tag value="REMITO" severity="secondary" className="mt-1" />
        )}
      </div>
    );
  };

  const fechaBodyTemplate = (rowData) => {
    const date = new Date(rowData.fecha);
    return (
      <span>{date.toLocaleDateString('es-AR')}</span>
    );
  };

  const clienteBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.clienteName}</div>
        {rowData.clienteCuit && (
          <div className="text-sm text-gray-600">CUIT: {rowData.clienteCuit}</div>
        )}
      </div>
    );
  };

  const tipoBodyTemplate = (rowData) => {
    const tipoConfig = {
      'A': { severity: 'info', icon: '🔵' },
      'B': { severity: 'success', icon: '🟢' },
      'C': { severity: 'warning', icon: '🟡' },
      'REMITO': { severity: 'secondary', icon: '📋' }
    };

    const config = tipoConfig[rowData.tipo] || { severity: 'secondary', icon: '' };

    return (
      <Tag
        value={`${config.icon} Tipo ${rowData.tipo}`}
        severity={config.severity}
      />
    );
  };

  const montoBodyTemplate = (rowData) => {
    return <span className="font-semibold">{formatCurrency(rowData.monto)}</span>;
  };

  const caeBodyTemplate = (rowData) => {
    if (rowData.cae) {
      return (
        <div>
          <div className="font-mono text-sm">{rowData.cae}</div>
          {rowData.vencimientoCae && (
            <div className="text-xs text-gray-600">
              Vto: {new Date(rowData.vencimientoCae).toLocaleDateString('es-AR')}
            </div>
          )}
        </div>
      );
    }
    return <span className="text-gray-400">Pendiente</span>;
  };

  const estadoBodyTemplate = (rowData) => {
    const estadoConfig = {
      emitida: { label: '✅ Emitida', severity: 'success' },
      pendiente: { label: '⏳ Pendiente', severity: 'warning' },
      anulada: { label: '❌ Anulada', severity: 'danger' },
      error: { label: '⚠️ Error', severity: 'danger' }
    };

    const config = estadoConfig[rowData.estado] || { label: rowData.estado, severity: 'secondary' };

    return (
      <Tag
        value={config.label}
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
          tooltip="Ver detalle"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleView(rowData.id);
          }}
        />
        {rowData.estado === 'emitida' && (
          <>
            <Button
              icon="pi pi-download"
              className="action-button"
              tooltip="Descargar PDF"
              tooltipOptions={{ position: 'top' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(rowData.id);
              }}
            />
            <Button
              icon="pi pi-times"
              className="action-button"
              tooltip="Anular"
              tooltipOptions={{ position: 'top' }}
              onClick={(e) => {
                e.stopPropagation();
                handleAnular(rowData.id);
              }}
            />
          </>
        )}
      </div>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2 align-items-center flex-wrap">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar factura..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={selectedTipo}
          onChange={(e) => setSelectedTipo(e.value)}
          options={[
            { label: 'Todos los tipos', value: null },
            ...Object.keys(INVOICE_TYPES).map(key => ({
              label: `Tipo ${INVOICE_TYPES[key]}`,
              value: INVOICE_TYPES[key]
            }))
          ]}
          placeholder="Filtrar por tipo"
          showClear={!!selectedTipo}
        />
        <Dropdown
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.value)}
          options={[
            { label: 'Todos los estados', value: null },
            { label: 'Emitida', value: 'emitida' },
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'Anulada', value: 'anulada' },
            { label: 'Error', value: 'error' }
          ]}
          placeholder="Filtrar por estado"
          showClear={!!selectedEstado}
        />
      </div>
      <Button
        label="Nueva Factura Manual"
        icon="pi pi-plus"
        onClick={handleNewFactura}
        className="p-button-danger"
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">📄 Facturación</h1>
        <p className="text-gray-600">
          Emisión y gestión de facturas electrónicas AFIP
        </p>
      </div>

      <DataTable
        value={facturas}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron facturas"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="numero"
          header="N° Factura"
          body={numeroBodyTemplate}
          sortable
          style={{ minWidth: '180px' }}
        />
        <Column
          field="fecha"
          header="Fecha"
          body={fechaBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="clienteName"
          header="Cliente"
          body={clienteBodyTemplate}
          sortable
          style={{ minWidth: '200px' }}
        />
        <Column
          field="tipo"
          header="Tipo"
          body={tipoBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="monto"
          header="Monto"
          body={montoBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="cae"
          header="CAE"
          body={caeBodyTemplate}
          style={{ minWidth: '180px' }}
        />
        <Column
          field="estado"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
          style={{ minWidth: '130px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '180px' }}
        />
      </DataTable>
    </div>
  );
};

export default Facturacion;
