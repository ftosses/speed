import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { mockCobranzas, mockClients } from '../../services/mockData';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Cobros = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [cobros, setCobros] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCobro, setSelectedCobro] = useState(null);
  const [editedMonto, setEditedMonto] = useState(0);
  const [editedMetodo, setEditedMetodo] = useState('');
  const [editedUtilidad, setEditedUtilidad] = useState(0);
  const [editedEstadoFacturacion, setEditedEstadoFacturacion] = useState('');
  const [showNewCobroModal, setShowNewCobroModal] = useState(false);
  const [newCobroData, setNewCobroData] = useState({
    clienteId: null,
    monto: 0,
    fecha: new Date(),
    metodo: '',
    utilidad: 0
  });

  useEffect(() => {
    let filteredCobros = mockCobranzas;

    // Filter by zone - look up zone through client relationship
    if (selectedZone) {
      // Get all client IDs in the selected zone
      const clientIdsInZone = mockClients
        .filter(c => c.zone === selectedZone.id)
        .map(c => c.id);
      
      // Filter cobros by client zone
      filteredCobros = filteredCobros.filter(c => 
        clientIdsInZone.includes(c.clienteId)
      );
    }

    if (selectedMethod) {
      filteredCobros = filteredCobros.filter(c => c.metodo === selectedMethod);
    }

    if (selectedEstado) {
      filteredCobros = filteredCobros.filter(c => c.estado === selectedEstado);
    }

    setCobros(filteredCobros);
  }, [selectedZone, selectedMethod, selectedEstado]);

  const handleRowClick = (e) => {
    setSelectedCobro(e.data);
    setEditedMonto(e.data.monto);
    setEditedMetodo(e.data.metodo);
    setEditedUtilidad(e.data.utilidad || 0);
    setEditedEstadoFacturacion(e.data.estadoFacturacion || 'Pendiente');
    setShowDetailModal(true);
  };

  const handleNewCobro = () => {
    setNewCobroData({
      clienteId: null,
      monto: 0,
      fecha: new Date(),
      metodo: '',
      utilidad: 0
    });
    setShowNewCobroModal(true);
  };

  const handleSaveNewCobro = () => {
    console.log('Guardando nuevo cobro:', newCobroData);
    alert('Cobro registrado exitosamente');
    setShowNewCobroModal(false);
    setNewCobroData({
      clienteId: null,
      monto: 0,
      fecha: new Date(),
      metodo: '',
      utilidad: 0
    });
  };

  const handleFacturarNewCobro = () => {
    console.log('Guardando y facturando nuevo cobro:', newCobroData);
    alert('Cobro registrado y enviado a Facturación exitosamente');
    setShowNewCobroModal(false);
    setNewCobroData({
      clienteId: null,
      monto: 0,
      fecha: new Date(),
      metodo: '',
      utilidad: 0
    });
  };

  const handleSaveChanges = () => {
    console.log('Guardando cambios:', {
      id: selectedCobro.id,
      monto: editedMonto,
      metodo: editedMetodo,
      utilidad: editedUtilidad
    });
    // Aquí iría la lógica para guardar en el backend
    setShowDetailModal(false);
    setSelectedCobro(null);
  };

  const handleFacturar = () => {
    console.log('Facturando cobro:', selectedCobro.id);
    // Aquí iría la lógica para cambiar estado a "Facturado" y enviar a sección Facturación
    alert('Cobro enviado a Facturación exitosamente');
    setShowDetailModal(false);
    setSelectedCobro(null);
  };

  const metodoOptions = [
    { label: '💵 Efectivo', value: PAYMENT_METHODS.EFECTIVO },
    { label: '📱 EFT/TRANS', value: PAYMENT_METHODS.EFT_TRANS },
    { label: '📝 Cheque', value: PAYMENT_METHODS.CHEQUE }
  ];

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
      [PAYMENT_METHODS.CHEQUE]: { icon: '📝', severity: 'warning' },
      [PAYMENT_METHODS.CUENTA_CORRIENTE]: { icon: '📋', severity: 'secondary' }
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

  const utilidadBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center">
        <span className="font-semibold text-green-600">{rowData.utilidad || 0}%</span>
      </div>
    );
  };

  const estadoFacturacionBodyTemplate = (rowData) => {
    const isFacturado = rowData.estadoFacturacion === 'Facturado';
    return (
      <Tag
        value={isFacturado ? '🟢 Facturado' : '🟡 Factura pendiente'}
        severity={isFacturado ? 'success' : 'warning'}
      />
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #F9F9F9',
            color: '#E31E24',
            borderRadius: '8px',
            minHeight: '40px',
            minWidth: '40px'
          }}
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
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2 align-items-center flex-wrap">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar cobro..."
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
            { label: 'Pendiente', value: 'pendiente' }
          ]}
          placeholder="Filtrar por estado"
          showClear={!!selectedEstado}
        />
      </div>
      <Button
        label="Registrar Cobro"
        icon="pi pi-plus"
        onClick={handleNewCobro}
        className="p-button-danger"
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">💰 Cobros</h1>
        <p className="text-gray-600">
          Registro y control de pagos recibidos
        </p>
      </div>

      <DataTable
        value={cobros}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron cobros"
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
          field="utilidad"
          header="Utilidad"
          body={utilidadBodyTemplate}
          sortable
          style={{ minWidth: '100px' }}
        />
        <Column
          field="estadoFacturacion"
          header="Estado Facturación"
          body={estadoFacturacionBodyTemplate}
          sortable
          style={{ minWidth: '160px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '100px' }}
        />
      </DataTable>

      {/* Cobro Detail Modal */}
      <Dialog
        visible={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        header="Detalle del Cobro"
        style={{ width: '700px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        {selectedCobro && (
          <div className="p-fluid">
            <div className="mb-4">
              <h3 className="mb-3">Información del Cobro</h3>

              <div className="grid">
                <div className="col-6 mb-3">
                  <strong>Cliente:</strong>
                  <div className="mt-1 text-lg">{selectedCobro.clienteName}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Fecha:</strong>
                  <div className="mt-1">{new Date(selectedCobro.fecha).toLocaleString('es-AR')}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Repartidor:</strong>
                  <div className="mt-1">{selectedCobro.repartidorName}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Estado Verificación:</strong>
                  <div className="mt-1">
                    <Tag
                      value={selectedCobro.estado === 'verificado' ? '✅ Verificado' : '⏳ Pendiente'}
                      severity={selectedCobro.estado === 'verificado' ? 'success' : 'warning'}
                    />
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="grid">
                <div className="col-12 mb-3">
                  <label htmlFor="monto" className="font-bold mb-2 block">
                    Monto
                  </label>
                  <InputNumber
                    id="monto"
                    value={editedMonto}
                    onValueChange={(e) => setEditedMonto(e.value)}
                    mode="currency"
                    currency="ARS"
                    locale="es-AR"
                    className="w-full"
                  />
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="metodo" className="font-bold mb-2 block">
                    Método de Pago
                  </label>
                  <Dropdown
                    id="metodo"
                    value={editedMetodo}
                    options={metodoOptions}
                    onChange={(e) => setEditedMetodo(e.value)}
                    placeholder="Seleccionar método"
                    className="w-full"
                  />
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="utilidad" className="font-bold mb-2 block">
                    Utilidad (%)
                  </label>
                  <InputNumber
                    id="utilidad"
                    value={editedUtilidad}
                    onValueChange={(e) => setEditedUtilidad(e.value)}
                    mode="decimal"
                    minFractionDigits={0}
                    maxFractionDigits={2}
                    min={0}
                    max={100}
                    suffix="%"
                    className="w-full"
                  />
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="estadoFacturacion" className="font-bold mb-2 block">
                    Estado de Facturación
                  </label>
                  <Dropdown
                    id="estadoFacturacion"
                    value={editedEstadoFacturacion}
                    options={[
                      { label: 'Pendiente', value: 'Pendiente' },
                      { label: 'Facturado', value: 'Facturado' },
                      { label: 'No Facturar', value: 'No Facturar' }
                    ]}
                    onChange={(e) => setEditedEstadoFacturacion(e.value)}
                    placeholder="Seleccionar estado"
                    className="w-full"
                  />
                </div>

                {selectedCobro.comprobante && (
                  <div className="col-12 mb-3">
                    <label className="font-bold mb-2 block">
                      Comprobante
                    </label>
                    <Button
                      label="Ver Comprobante"
                      icon="pi pi-file"
                      className="p-button-outlined"
                      onClick={() => console.log('Ver comprobante:', selectedCobro.comprobante)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-content-between gap-2 mt-4">
              <div>
                {selectedCobro.estadoFacturacion !== 'Facturado' && (
                  <Button
                    label="FACTURAR"
                    icon="pi pi-file-check"
                    className="p-button-success"
                    onClick={handleFacturar}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  className="p-button-text"
                  onClick={() => setShowDetailModal(false)}
                />
                <Button
                  label="Guardar Cambios"
                  icon="pi pi-check"
                  onClick={handleSaveChanges}
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Registrar Nuevo Cobro Modal */}
      <Dialog
        visible={showNewCobroModal}
        onHide={() => setShowNewCobroModal(false)}
        header="Registrar Nuevo Cobro"
        style={{ width: '700px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        <div className="p-4">
          <div className="grid">
            <div className="col-12 mb-3">
              <label className="block text-sm font-semibold mb-2">Cliente *</label>
              <Dropdown
                value={newCobroData.clienteId}
                options={mockClients.map(client => ({
                  label: client.name,
                  value: client.id
                }))}
                onChange={(e) => setNewCobroData({ ...newCobroData, clienteId: e.value })}
                placeholder="Seleccionar cliente"
                className="w-full"
                filter
                filterPlaceholder="Buscar cliente..."
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Monto *</label>
              <InputNumber
                value={newCobroData.monto}
                onValueChange={(e) => setNewCobroData({ ...newCobroData, monto: e.value })}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Fecha *</label>
              <Calendar
                value={newCobroData.fecha}
                onChange={(e) => setNewCobroData({ ...newCobroData, fecha: e.value })}
                showIcon
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Método de Pago *</label>
              <Dropdown
                value={newCobroData.metodo}
                options={[
                  { label: '💵 Efectivo', value: PAYMENT_METHODS.EFECTIVO },
                  { label: '📱 EFT/TRANS', value: PAYMENT_METHODS.EFT_TRANS },
                  { label: '📝 Cheque', value: PAYMENT_METHODS.CHEQUE }
                ]}
                onChange={(e) => setNewCobroData({ ...newCobroData, metodo: e.value })}
                placeholder="Seleccionar método"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Utilidad % *</label>
              <InputNumber
                value={newCobroData.utilidad}
                onValueChange={(e) => setNewCobroData({ ...newCobroData, utilidad: e.value })}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                min={0}
                max={100}
                suffix="%"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-content-between gap-2 mt-4">
            <Button
              label="FACTURAR"
              icon="pi pi-file-check"
              className="p-button-success"
              onClick={handleFacturarNewCobro}
              disabled={!newCobroData.clienteId || !newCobroData.monto || !newCobroData.metodo}
            />
            <div className="flex gap-2">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowNewCobroModal(false)}
              />
              <Button
                label="Guardar Cobro"
                icon="pi pi-check"
                className="p-button-danger"
                onClick={handleSaveNewCobro}
                disabled={!newCobroData.clienteId || !newCobroData.monto || !newCobroData.metodo}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Cobros;
