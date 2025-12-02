import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { mockCobranzas } from '../../services/mockData';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Cobranzas = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [cobranzas, setCobranzas] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState(null);

  useEffect(() => {
    let filteredCobranzas = mockCobranzas;

    if (selectedZone) {
      filteredCobranzas = filteredCobranzas.filter(c => c.zone === selectedZone.id);
    }

    if (selectedMethod) {
      filteredCobranzas = filteredCobranzas.filter(c => c.metodo === selectedMethod);
    }

    if (selectedEstado) {
      filteredCobranzas = filteredCobranzas.filter(c => c.estado === selectedEstado);
    }

    setCobranzas(filteredCobranzas);
  }, [selectedZone, selectedMethod, selectedEstado]);

  const handleRowClick = (e) => {
    navigate(`/admin/cobranzas/${e.data.id}`);
  };

  const handleNewCobranza = () => {
    console.log('Registrar nueva cobranza');
  };

  const handleView = (cobranzaId) => {
    navigate(`/admin/cobranzas/${cobranzaId}`);
  };

  const handleVerify = (cobranzaId) => {
    console.log('Verificar cobranza:', cobranzaId);
  };

  // Column templates
  const fechaBodyTemplate = (rowData) => {
    const date = new Date(rowData.fecha);
    return (
      <div>
        <div className="font-semibold">
          {date.toLocaleDateString('es-AR')}
        </div>
        <div className="text-sm text-gray-600">
          {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  const clienteBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.clienteName}</div>
        {rowData.ordenId && (
          <div className="text-sm text-gray-600">Orden #{rowData.ordenId}</div>
        )}
      </div>
    );
  };

  const repartidorBodyTemplate = (rowData) => {
    return rowData.repartidorName || '-';
  };

  const metodoBodyTemplate = (rowData) => {
    const metodoConfig = {
      [PAYMENT_METHODS.EFECTIVO]: { icon: '💵', severity: 'success' },
      [PAYMENT_METHODS.EFT_TRANS]: { icon: '📱', severity: 'info' },
      [PAYMENT_METHODS.TARJETA]: { icon: '💳', severity: 'info' },
      [PAYMENT_METHODS.CUENTA_CORRIENTE]: { icon: '📋', severity: 'warning' }
    };

    const config = metodoConfig[rowData.metodo] || { icon: '', severity: 'secondary' };

    return (
      <Tag
        value={`${config.icon} ${PAYMENT_METHOD_LABELS[rowData.metodo]}`}
        severity={config.severity}
      />
    );
  };

  const montoBodyTemplate = (rowData) => {
    return <span className="font-semibold">{formatCurrency(rowData.monto)}</span>;
  };

  const comprobanteBodyTemplate = (rowData) => {
    if (rowData.comprobante) {
      return (
        <Button
          icon="pi pi-file"
          label="Ver"
          className="p-button-text p-button-sm"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Ver comprobante:', rowData.comprobante);
          }}
        />
      );
    }
    return <span className="text-gray-400">Sin comprobante</span>;
  };

  const estadoBodyTemplate = (rowData) => {
    const estadoConfig = {
      verificado: { label: '✅ Verificado', severity: 'success' },
      pendiente: { label: '⏳ Pendiente', severity: 'warning' },
      rechazado: { label: '❌ Rechazado', severity: 'danger' }
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
        {rowData.estado === 'pendiente' && (
          <Button
            icon="pi pi-check"
            className="action-button"
            tooltip="Verificar"
            tooltipOptions={{ position: 'top' }}
            onClick={(e) => {
              e.stopPropagation();
              handleVerify(rowData.id);
            }}
          />
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
            placeholder="Buscar cobranza..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.value)}
          options={[
            { label: 'Todos los métodos', value: null },
            ...Object.keys(PAYMENT_METHODS).map(key => ({
              label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS[key]],
              value: PAYMENT_METHODS[key]
            }))
          ]}
          placeholder="Filtrar por método"
          showClear={!!selectedMethod}
        />
        <Dropdown
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.value)}
          options={[
            { label: 'Todos los estados', value: null },
            { label: 'Verificado', value: 'verificado' },
            { label: 'Pendiente', value: 'pendiente' },
            { label: 'Rechazado', value: 'rechazado' }
          ]}
          placeholder="Filtrar por estado"
          showClear={!!selectedEstado}
        />
      </div>
      <Button
        label="Registrar Cobranza"
        icon="pi pi-plus"
        onClick={handleNewCobranza}
        className="p-button-danger"
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">💰 Cobranzas</h1>
        <p className="text-gray-600">
          Registro y control de pagos recibidos
        </p>
      </div>

      <DataTable
        value={cobranzas}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron cobranzas"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="fecha"
          header="Fecha/Hora"
          body={fechaBodyTemplate}
          sortable
          style={{ minWidth: '140px' }}
        />
        <Column
          field="clienteName"
          header="Cliente"
          body={clienteBodyTemplate}
          sortable
          style={{ minWidth: '200px' }}
        />
        <Column
          field="repartidorName"
          header="Repartidor"
          body={repartidorBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="metodo"
          header="Método"
          body={metodoBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="monto"
          header="Monto"
          body={montoBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="comprobante"
          header="Comprobante"
          body={comprobanteBodyTemplate}
          style={{ minWidth: '140px' }}
        />
        <Column
          field="estado"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
          style={{ minWidth: '140px' }}
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

export default Cobranzas;
