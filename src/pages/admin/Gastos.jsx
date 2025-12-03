import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { mockGastos } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';

const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [editedEstado, setEditedEstado] = useState('');
  const [editedObservaciones, setEditedObservaciones] = useState('');

  useEffect(() => {
    let filteredGastos = mockGastos;

    if (selectedRepartidor) {
      filteredGastos = filteredGastos.filter(g => g.repartidorId === selectedRepartidor);
    }

    if (selectedTipo) {
      filteredGastos = filteredGastos.filter(g => g.tipo === selectedTipo);
    }

    if (selectedEstado) {
      filteredGastos = filteredGastos.filter(g => g.estado === selectedEstado);
    }

    if (startDate && endDate) {
      filteredGastos = filteredGastos.filter(g => {
        const gastoDate = new Date(g.fecha);
        return gastoDate >= startDate && gastoDate <= endDate;
      });
    }

    setGastos(filteredGastos);
  }, [selectedRepartidor, selectedTipo, selectedEstado, startDate, endDate]);

  const repartidorOptions = [
    { label: 'Todos', value: null },
    { label: 'Juan Pérez', value: 1 },
    { label: 'Pedro Gómez', value: 2 }
  ];

  const tipoOptions = [
    { label: 'Todos', value: null },
    { label: 'Nafta', value: 'Nafta' },
    { label: 'Peaje', value: 'Peaje' },
    { label: 'Vianda', value: 'Vianda' },
    { label: 'Viático', value: 'Viático' },
    { label: 'Otro', value: 'Otro' }
  ];

  const estadoOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Rechazado', value: 'Rechazado' }
  ];

  const handleRowClick = (e) => {
    setSelectedGasto(e.data);
    setEditedEstado(e.data.estado);
    setEditedObservaciones(e.data.observaciones || '');
    setShowDetailModal(true);
  };

  const handleSaveChanges = () => {
    console.log('Guardando cambios:', {
      id: selectedGasto.id,
      estado: editedEstado,
      observaciones: editedObservaciones
    });
    // Aquí iría la lógica para guardar en el backend
    setShowDetailModal(false);
    setSelectedGasto(null);
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

  const tipoBodyTemplate = (rowData) => {
    const tipoIcons = {
      'Nafta': '⛽',
      'Peaje': '🛣️',
      'Vianda': '🍱',
      'Viático': '💼',
      'Otro': '📋'
    };

    return (
      <div className="flex align-items-center">
        <span className="mr-2">{tipoIcons[rowData.tipo] || '📋'}</span>
        <span>{rowData.tipo}</span>
      </div>
    );
  };

  const montoBodyTemplate = (rowData) => {
    return <span className="font-semibold">{formatCurrency(rowData.monto)}</span>;
  };

  const comprobanteBodyTemplate = (rowData) => {
    if (rowData.comprobante) {
      return (
        <Button
          icon="pi pi-image"
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
      'Pendiente': { label: '⏳ Pendiente', severity: 'warning' },
      'Aprobado': { label: '✅ Aprobado', severity: 'success' },
      'Rechazado': { label: '❌ Rechazado', severity: 'danger' }
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
            handleRowClick({ data: rowData });
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center flex-wrap gap-3">
      <div className="flex gap-2 align-items-center flex-wrap">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar gasto..."
          />
        </span>
        <Dropdown
          value={selectedRepartidor}
          onChange={(e) => setSelectedRepartidor(e.value)}
          options={repartidorOptions}
          placeholder="Filtrar por repartidor"
          showClear={selectedRepartidor !== null}
        />
        <Dropdown
          value={selectedTipo}
          onChange={(e) => setSelectedTipo(e.value)}
          options={tipoOptions}
          placeholder="Filtrar por tipo"
          showClear={selectedTipo !== null}
        />
        <Dropdown
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.value)}
          options={[
            { label: 'Todos', value: null },
            ...estadoOptions
          ]}
          placeholder="Filtrar por estado"
          showClear={selectedEstado !== null}
        />
        <Calendar
          value={startDate}
          onChange={(e) => setStartDate(e.value)}
          placeholder="Desde"
          dateFormat="dd/mm/yy"
          showIcon
        />
        <Calendar
          value={endDate}
          onChange={(e) => setEndDate(e.value)}
          placeholder="Hasta"
          dateFormat="dd/mm/yy"
          showIcon
        />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">💰 Gastos de Repartidores</h1>
        <p className="text-gray-600">
          Gestión y aprobación de gastos operativos
        </p>
      </div>

      <DataTable
        value={gastos}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron gastos"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="fecha"
          header="Fecha"
          body={fechaBodyTemplate}
          sortable
          style={{ minWidth: '140px' }}
        />
        <Column
          field="repartidorName"
          header="Repartidor"
          sortable
          style={{ minWidth: '150px' }}
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
          field="descripcion"
          header="Descripción"
          style={{ minWidth: '200px' }}
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
          style={{ minWidth: '100px' }}
        />
      </DataTable>

      {/* Gasto Detail Modal */}
      <Dialog
        visible={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        header="Detalle del Gasto"
        style={{ width: '700px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        {selectedGasto && (
          <div className="p-fluid">
            <div className="mb-4">
              <h3 className="mb-3">Información del Gasto</h3>

              <div className="grid">
                <div className="col-6 mb-3">
                  <strong>Repartidor:</strong>
                  <div className="mt-1 text-lg">{selectedGasto.repartidorName}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Fecha:</strong>
                  <div className="mt-1">{new Date(selectedGasto.fecha).toLocaleString('es-AR')}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Tipo:</strong>
                  <div className="mt-1">{tipoBodyTemplate(selectedGasto)}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Monto:</strong>
                  <div className="mt-1 font-bold text-xl">{formatCurrency(selectedGasto.monto)}</div>
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
                        label="Ver Imagen del Comprobante"
                        icon="pi pi-image"
                        className="p-button-outlined"
                        onClick={() => console.log('Ver comprobante:', selectedGasto.comprobante)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-4" />

              <div className="grid">
                <div className="col-12 mb-3">
                  <label htmlFor="estado" className="font-bold mb-2 block">
                    Estado
                  </label>
                  <Dropdown
                    id="estado"
                    value={editedEstado}
                    options={estadoOptions}
                    onChange={(e) => setEditedEstado(e.value)}
                    placeholder="Seleccionar estado"
                    className="w-full"
                  />
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="observaciones" className="font-bold mb-2 block">
                    Observaciones
                  </label>
                  <InputTextarea
                    id="observaciones"
                    value={editedObservaciones}
                    onChange={(e) => setEditedObservaciones(e.target.value)}
                    rows={4}
                    placeholder="Agregar observaciones sobre este gasto..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowDetailModal(false)}
              />
              <Button
                label="Guardar"
                icon="pi pi-check"
                onClick={handleSaveChanges}
                autoFocus
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Gastos;
