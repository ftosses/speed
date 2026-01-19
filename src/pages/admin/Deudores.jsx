import React, { useState, useMemo } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { useZone } from '../../context/ZoneContext';
import { mockClients } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';
import { ZONES, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../utils/constants';

const Deudores = () => {
  const { selectedZone } = useZone();
  const [globalFilter, setGlobalFilter] = useState('');
  const [debtRangeFilter, setDebtRangeFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Registrar Pago modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.EFECTIVO);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  // Ajustar Deuda modal state
  const [showAdjustDebtModal, setShowAdjustDebtModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('descuento');
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Filter debtors
  const deudores = useMemo(() => {
    let filtered = mockClients.filter(client => client.deudaTotal > 0);

    // Zone filter
    if (selectedZone) {
      filtered = filtered.filter(client => client.zone === selectedZone.id);
    }
    if (zoneFilter) {
      filtered = filtered.filter(client => client.zone === zoneFilter);
    }

    // Debt range filter
    if (debtRangeFilter) {
      if (debtRangeFilter === 'low') {
        filtered = filtered.filter(client => client.deudaTotal < 20000);
      } else if (debtRangeFilter === 'medium') {
        filtered = filtered.filter(client => client.deudaTotal >= 20000 && client.deudaTotal < 80000);
      } else if (debtRangeFilter === 'high') {
        filtered = filtered.filter(client => client.deudaTotal >= 80000);
      }
    }

    return filtered;
  }, [selectedZone, zoneFilter, debtRangeFilter]);

  // Calculate summary
  const totalDebt = useMemo(() => {
    return deudores.reduce((sum, client) => sum + client.deudaTotal, 0);
  }, [deudores]);

  const debtRangeOptions = [
    { label: 'Todas las deudas', value: null },
    { label: 'Menor a $20,000', value: 'low' },
    { label: '$20,000 - $80,000', value: 'medium' },
    { label: 'Mayor a $80,000', value: 'high' }
  ];

  const zoneOptions = [
    { label: 'Todas las zonas', value: null },
    ...Object.values(ZONES).map(zone => ({ label: zone.name, value: zone.id }))
  ];

  const handleViewDetail = (debtor) => {
    setSelectedDebtor(debtor);
    setShowDetailModal(true);
  };

  const handleOpenPaymentModal = () => {
    setPaymentAmount(0);
    setPaymentMethod(PAYMENT_METHODS.EFECTIVO);
    setPaymentDate(new Date());
    setPaymentReceipt(null);
    setShowPaymentModal(true);
  };

  const handleSavePayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Debe ingresar un monto válido');
      return;
    }
    if (paymentAmount > selectedDebtor.deudaTotal) {
      alert('El monto del pago no puede ser mayor a la deuda total');
      return;
    }

    console.log('Registrando pago:', {
      cliente: selectedDebtor.name,
      monto: paymentAmount,
      metodo: paymentMethod,
      fecha: paymentDate,
      comprobante: paymentReceipt?.name
    });

    alert(`Pago de ${formatCurrency(paymentAmount)} registrado exitosamente`);
    setShowPaymentModal(false);
    setShowDetailModal(false);
  };

  const handleOpenAdjustDebtModal = () => {
    setAdjustmentType('descuento');
    setAdjustmentAmount(0);
    setAdjustmentReason('');
    setShowAdjustDebtModal(true);
  };

  const handleSaveAdjustment = () => {
    if (!adjustmentAmount || adjustmentAmount <= 0) {
      alert('Debe ingresar un monto válido');
      return;
    }
    if (!adjustmentReason.trim()) {
      alert('Debe ingresar un motivo para el ajuste');
      return;
    }

    console.log('Ajustando deuda:', {
      cliente: selectedDebtor.name,
      tipo: adjustmentType,
      monto: adjustmentAmount,
      motivo: adjustmentReason
    });

    alert(`Ajuste de deuda de ${formatCurrency(adjustmentAmount)} registrado exitosamente`);
    setShowAdjustDebtModal(false);
    setShowDetailModal(false);
  };

  const countOrdersBody = (rowData) => {
    return rowData.desgloseBajadas?.length || 0;
  };

  const amountBody = (rowData) => {
    return <span className="font-bold">{formatCurrency(rowData.deudaTotal)}</span>;
  };

  const actionsBody = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            color: '#E31E24',
            border: 'none',
            borderRadius: '6px',
            minWidth: '40px',
            minHeight: '40px'
          }}
          onClick={() => handleViewDetail(rowData)}
          tooltip="Ver detalle"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            color: '#E31E24',
            border: 'none',
            borderRadius: '6px',
            minWidth: '40px',
            minHeight: '40px'
          }}
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-3">
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar cliente..."
            style={{ width: '300px' }}
          />
        </span>
        <Dropdown
          value={debtRangeFilter}
          options={debtRangeOptions}
          onChange={(e) => setDebtRangeFilter(e.value)}
          placeholder="Rango de deuda"
          style={{ width: '200px' }}
        />
        {!selectedZone && (
          <Dropdown
            value={zoneFilter}
            options={zoneOptions}
            onChange={(e) => setZoneFilter(e.value)}
            placeholder="Zona"
            style={{ width: '180px' }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>💰 Deudores</h1>
        <p>Gestión de clientes con saldo pendiente</p>
      </div>

      {/* Summary Cards */}
      <div className="grid mb-4">
        <div className="col-12 md:col-6">
          <Card>
            <div className="flex align-items-center gap-3">
              <div style={{
                backgroundColor: '#EF444415',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="pi pi-dollar" style={{ fontSize: '2rem', color: '#EF4444' }}></i>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Monto Total Adeudado</div>
                <div className="text-3xl font-bold" style={{ color: '#EF4444' }}>
                  {formatCurrency(totalDebt)}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6">
          <Card>
            <div className="flex align-items-center gap-3">
              <div style={{
                backgroundColor: '#F59E0B15',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="pi pi-users" style={{ fontSize: '2rem', color: '#F59E0B' }}></i>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Número de Deudores</div>
                <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                  {deudores.length}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Debtors Table */}
      <Card>
        <DataTable
          value={deudores}
          paginator
          rows={10}
          dataKey="id"
          globalFilter={globalFilter}
          header={header}
          emptyMessage="No hay deudores"
          stripedRows
          className="datatable-responsive"
        >
          <Column field="name" header="Cliente" sortable style={{ minWidth: '200px' }} />
          <Column
            header="Cantidad de Pedidos"
            body={countOrdersBody}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column
            field="deudaTotal"
            header="Monto Total"
            body={amountBody}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column
            field="zone"
            header="Zona"
            body={(rowData) => {
              const zone = Object.values(ZONES).find(z => z.id === rowData.zone);
              return zone ? <Tag value={zone.name} style={{ backgroundColor: zone.color }} /> : '-';
            }}
            sortable
            style={{ minWidth: '120px' }}
          />
          <Column
            header="Acciones"
            body={actionsBody}
            exportable={false}
            style={{ minWidth: '120px' }}
          />
        </DataTable>
      </Card>

      {/* Detail Modal */}
      <Dialog
        visible={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        header={`Detalle de Deuda - ${selectedDebtor?.name}`}
        style={{ width: '800px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        {selectedDebtor && (
          <div>
            <div className="mb-4 p-3" style={{ backgroundColor: '#FEE2E2', borderRadius: '8px' }}>
              <div className="flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">Deuda Total</h3>
                <span className="text-3xl font-bold" style={{ color: '#EF4444' }}>
                  {formatCurrency(selectedDebtor.deudaTotal)}
                </span>
              </div>
            </div>

            <h4 className="mb-3">Desglose por Bajada</h4>
            <DataTable
              value={selectedDebtor.desgloseBajadas || []}
              emptyMessage="No hay bajadas registradas"
            >
              <Column
                field="fecha"
                header="Fecha"
                body={(rowData) => new Date(rowData.fecha).toLocaleDateString('es-AR')}
              />
              <Column
                field="montoOriginal"
                header="Monto Original"
                body={(rowData) => formatCurrency(rowData.montoOriginal)}
              />
              <Column
                field="montoPagado"
                header="Pagado"
                body={(rowData) => (
                  <span style={{ color: '#10B981' }}>{formatCurrency(rowData.montoPagado)}</span>
                )}
              />
              <Column
                field="saldoPendiente"
                header="Saldo Pendiente"
                body={(rowData) => (
                  <span className="font-bold" style={{ color: '#EF4444' }}>
                    {formatCurrency(rowData.saldoPendiente)}
                  </span>
                )}
              />
            </DataTable>

            <div className="mt-4 flex justify-content-end gap-2">
              <Button
                label="Registrar Pago"
                icon="pi pi-dollar"
                severity="success"
                onClick={handleOpenPaymentModal}
              />
              <Button
                label="Ajustar Deuda"
                icon="pi pi-pencil"
                severity="warning"
                onClick={handleOpenAdjustDebtModal}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Registrar Pago Modal */}
      <Dialog
        visible={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        header="Registrar Pago"
        style={{ width: '600px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        <div className="p-fluid">
          {selectedDebtor && (
            <div className="mb-4 p-3" style={{ backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
              <div className="flex justify-content-between align-items-center">
                <div>
                  <div className="text-sm text-gray-600">Cliente</div>
                  <div className="font-bold text-lg">{selectedDebtor.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Deuda Total</div>
                  <div className="font-bold text-xl" style={{ color: '#EF4444' }}>
                    {formatCurrency(selectedDebtor.deudaTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid">
            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="paymentAmount" className="font-bold mb-2 block">
                Monto del Pago *
              </label>
              <InputNumber
                id="paymentAmount"
                value={paymentAmount}
                onValueChange={(e) => setPaymentAmount(e.value)}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
                min={0}
                max={selectedDebtor?.deudaTotal}
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="paymentMethod" className="font-bold mb-2 block">
                Método de Pago *
              </label>
              <Dropdown
                id="paymentMethod"
                value={paymentMethod}
                options={Object.keys(PAYMENT_METHODS).map(key => ({
                  label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS[key]],
                  value: PAYMENT_METHODS[key]
                }))}
                onChange={(e) => setPaymentMethod(e.value)}
                placeholder="Seleccionar método"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="paymentDate" className="font-bold mb-2 block">
                Fecha del Pago *
              </label>
              <Calendar
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="paymentReceipt" className="font-bold mb-2 block">
                Comprobante
              </label>
              <FileUpload
                id="paymentReceipt"
                mode="basic"
                name="receipt"
                accept="image/*,application/pdf"
                maxFileSize={5000000}
                onSelect={(e) => setPaymentReceipt(e.files[0])}
                auto={false}
                chooseLabel="Seleccionar archivo"
                className="w-full"
              />
              {paymentReceipt && (
                <small className="block mt-1 text-green-600">
                  Archivo seleccionado: {paymentReceipt.name}
                </small>
              )}
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowPaymentModal(false)}
            />
            <Button
              label="Registrar Pago"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleSavePayment}
              disabled={!paymentAmount || paymentAmount <= 0}
            />
          </div>
        </div>
      </Dialog>

      {/* Ajustar Deuda Modal */}
      <Dialog
        visible={showAdjustDebtModal}
        onHide={() => setShowAdjustDebtModal(false)}
        header="Ajustar Deuda"
        style={{ width: '600px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        <div className="p-fluid">
          {selectedDebtor && (
            <div className="mb-4 p-3" style={{ backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
              <div className="flex justify-content-between align-items-center">
                <div>
                  <div className="text-sm text-gray-600">Cliente</div>
                  <div className="font-bold text-lg">{selectedDebtor.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Deuda Actual</div>
                  <div className="font-bold text-xl" style={{ color: '#EF4444' }}>
                    {formatCurrency(selectedDebtor.deudaTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid">
            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="adjustmentType" className="font-bold mb-2 block">
                Tipo de Ajuste *
              </label>
              <Dropdown
                id="adjustmentType"
                value={adjustmentType}
                options={[
                  { label: 'Descuento', value: 'descuento' },
                  { label: 'Incremento', value: 'incremento' },
                  { label: 'Condonación', value: 'condonacion' },
                  { label: 'Corrección', value: 'correccion' }
                ]}
                onChange={(e) => setAdjustmentType(e.value)}
                placeholder="Seleccionar tipo"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label htmlFor="adjustmentAmount" className="font-bold mb-2 block">
                Monto del Ajuste *
              </label>
              <InputNumber
                id="adjustmentAmount"
                value={adjustmentAmount}
                onValueChange={(e) => setAdjustmentAmount(e.value)}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
                min={0}
              />
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="adjustmentReason" className="font-bold mb-2 block">
                Motivo del Ajuste *
              </label>
              <InputTextarea
                id="adjustmentReason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                rows={4}
                placeholder="Describa el motivo del ajuste de deuda..."
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowAdjustDebtModal(false)}
            />
            <Button
              label="Aplicar Ajuste"
              icon="pi pi-check"
              className="p-button-warning"
              onClick={handleSaveAdjustment}
              disabled={!adjustmentAmount || adjustmentAmount <= 0 || !adjustmentReason.trim()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Deudores;
