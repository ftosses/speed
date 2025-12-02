import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { formatCurrency } from '../../utils/helpers';
import { PRODUCTS, PRICE_LISTS } from '../../utils/constants';
import PaymentModal from './PaymentModal';

const OrderDetailModal = ({ visible, onHide, order: propOrder }) => {
  const [order, setOrder] = useState(propOrder);
  const [deliveryStatus, setDeliveryStatus] = useState(propOrder?.status || 'pendiente');
  const [paymentStatus, setPaymentStatus] = useState(propOrder?.paymentStatus || 'pendiente');
  const [editMode, setEditMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(propOrder?.discountPercent || 0);
  const toastRef = React.useRef(null);

  useEffect(() => {
    if (propOrder) {
      setOrder(propOrder);
      setDeliveryStatus(propOrder.status || 'pendiente');
      setPaymentStatus(propOrder.paymentStatus || 'pendiente');
      setEditedItems(propOrder.items ? [...propOrder.items] : []);
      setDiscountPercent(propOrder.discountPercent || 0);
    }
  }, [propOrder]);

  if (!order || !order.client) return null;

  const { client } = order;

  const deliveryStatusOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Entregado', value: 'entregado' },
    { label: 'No entregado', value: 'no_entregado' }
  ];

  const paymentStatusOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pagado', value: 'pagado' },
    { label: 'No pagó', value: 'no_pago' }
  ];

  const handleMarkAsDelivered = () => {
    setDeliveryStatus('entregado');
    if (toastRef.current) {
      toastRef.current.show({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Pedido marcado como entregado',
        life: 3000
      });
    }
  };

  const handleItemQuantityChange = (itemIndex, newQuantity) => {
    const updatedItems = [...editedItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: newQuantity,
      subtotal: updatedItems[itemIndex].pricePerUnit * newQuantity
    };
    setEditedItems(updatedItems);
  };

  const handleRemoveItem = (itemIndex) => {
    const updatedItems = editedItems.filter((_, index) => index !== itemIndex);
    setEditedItems(updatedItems);
  };

  const handleSaveChanges = () => {
    const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newDiscount = (newSubtotal * discountPercent) / 100;
    const newTotal = newSubtotal - newDiscount;

    setOrder({
      ...order,
      items: editedItems,
      subtotal: newSubtotal,
      discountPercent,
      discount: newDiscount,
      total: newTotal
    });

    setEditMode(false);
    if (toastRef.current) {
      toastRef.current.show({
        severity: 'success',
        summary: 'Guardado',
        detail: 'Cambios guardados correctamente',
        life: 3000
      });
    }
  };

  const calculateCurrentTotal = () => {
    const subtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = (subtotal * discountPercent) / 100;
    return { subtotal, discount, total: subtotal - discount };
  };

  const handleRegisterPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = (paymentData) => {
    setPaymentStatus('pagado');
    setShowPaymentModal(false);

    if (toastRef.current) {
      toastRef.current.show({
        severity: 'success',
        summary: 'Pago registrado',
        detail: 'El pago ha sido registrado correctamente',
        life: 3000
      });
    }
  };

  const handleDownloadRemito = () => {
    if (toastRef.current) {
      toastRef.current.show({
        severity: 'warning',
        summary: '⚠️ Datos incompletos',
        detail: 'Generando remito. Admin facturará después.',
        life: 3000
      });
    }

    // Simulate PDF download
    setTimeout(() => {
      window.open('/mock-remito.pdf', '_blank');
      if (toastRef.current) {
        toastRef.current.show({
          severity: 'success',
          summary: 'Remito generado',
          detail: 'Documento descargado correctamente',
          life: 3000
        });
      }
    }, 1500);
  };

  const handleGenerateInvoice = () => {
    if (toastRef.current) {
      toastRef.current.show({
        severity: 'info',
        summary: 'Generando factura...',
        detail: 'Conectando con AFIP...',
        life: 2000
      });
    }

    // Simulate invoice generation
    setTimeout(() => {
      window.open('/mock-factura.pdf', '_blank');
      if (toastRef.current) {
        toastRef.current.show({
          severity: 'success',
          summary: 'Factura emitida ✅',
          detail: 'Factura generada correctamente',
          life: 3000
        });
      }
    }, 1500);
  };

  // Format Google Maps URL
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(client.address)}&output=embed`;

  return (
    <>
      <Toast ref={toastRef} />

      <Dialog
        visible={visible}
        onHide={onHide}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-shopping-cart text-2xl"></i>
            <span>Detalle del Pedido #{order.id}</span>
          </div>
        }
        style={{ width: '90vw', maxWidth: '900px' }}
        modal
        dismissableMask
      >
        <div>
          {/* Client Info Section */}
          <div className="mb-4 pb-3 border-bottom-1 border-gray-200">
            <h3 className="text-xl font-bold mb-2">👤 {client.name}</h3>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="flex align-items-center gap-2 mb-2">
                  <i className="pi pi-map-marker text-danger"></i>
                  <span>{client.address}</span>
                </div>
                <div className="flex align-items-center gap-2 mb-2">
                  <i className="pi pi-phone text-info"></i>
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-envelope text-warning"></i>
                    <span>{client.email}</span>
                  </div>
                )}
              </div>
              <div className="col-12 md:col-6">
                <div className="text-sm text-gray-600">Saldo actual</div>
                <div className={`text-2xl font-bold ${client.currentBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(Math.abs(client.currentBalance))}
                  {client.currentBalance < 0 && ' (DEBE)'}
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-3">
              <h4 className="mb-2">🗺️ Ubicación</h4>
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                src={mapsEmbedUrl}
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                title="Ubicación del cliente"
              ></iframe>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="mb-4 pb-3 border-bottom-1 border-gray-200">
            <h3 className="text-lg font-bold mb-3">📦 Detalle del Pedido</h3>
            {editMode ? (
              <div>
                {editedItems.map((item, index) => (
                  <div key={index} className="p-3 mb-2 border-1 border-gray-200 border-round">
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <label className="block text-sm font-semibold mb-2">Producto</label>
                        <div className="font-semibold">{item.productName}</div>
                      </div>
                      <div className="col-12 md:col-3">
                        <label className="block text-sm font-semibold mb-2">Cantidad</label>
                        <InputNumber
                          value={item.quantity}
                          onValueChange={(e) => handleItemQuantityChange(index, e.value)}
                          min={0}
                          className="w-full"
                        />
                      </div>
                      <div className="col-12 md:col-2">
                        <label className="block text-sm font-semibold mb-2">Precio Unit.</label>
                        <div className="font-semibold">{formatCurrency(item.pricePerUnit)}</div>
                      </div>
                      <div className="col-12 md:col-1">
                        <Button
                          icon="pi pi-trash"
                          className="p-button-danger p-button-text"
                          onClick={() => handleRemoveItem(index)}
                          tooltip="Eliminar"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="font-semibold">Subtotal: {formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-3 p-3 bg-gray-50 border-round">
                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <label className="block text-sm font-semibold mb-2">Descuento (%)</label>
                      <InputNumber
                        value={discountPercent}
                        onValueChange={(e) => setDiscountPercent(e.value)}
                        min={0}
                        max={100}
                        suffix="%"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-content-end">
                  <Button
                    label="Guardar Cambios"
                    icon="pi pi-check"
                    className="p-button-success"
                    onClick={handleSaveChanges}
                  />
                </div>
              </div>
            ) : (
              <>
                <DataTable value={order.items || []} size="small">
                  <Column field="productName" header="Producto" />
                  <Column
                    field="quantity"
                    header="Cantidad"
                    body={(rowData) => <span className="font-semibold">{rowData.quantity}</span>}
                  />
                  <Column
                    field="pricePerUnit"
                    header="Precio Unit."
                    body={(rowData) => formatCurrency(rowData.pricePerUnit)}
                  />
                  <Column
                    field="subtotal"
                    header="Subtotal"
                    body={(rowData) => <span className="font-semibold">{formatCurrency(rowData.subtotal)}</span>}
                  />
                </DataTable>

                <div className="mt-3 flex flex-column align-items-end">
                  <div className="flex gap-4 mb-2">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(order.subtotal || order.total)}</span>
                  </div>
                  {order.discountPercent > 0 && (
                    <div className="flex gap-4 mb-2 text-warning">
                      <span>Descuento ({order.discountPercent}%):</span>
                      <span className="font-semibold">- {formatCurrency(order.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex gap-4 text-2xl font-bold text-primary">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Status Section */}
          <div className="mb-4 pb-3 border-bottom-1 border-gray-200">
            <h3 className="text-lg font-bold mb-3">📊 Estado</h3>
            <div className="grid">
              <div className="col-12 md:col-6">
                <label className="block text-sm font-semibold mb-2">Estado de Entrega</label>
                <Dropdown
                  value={deliveryStatus}
                  options={deliveryStatusOptions}
                  onChange={(e) => setDeliveryStatus(e.value)}
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-6">
                <label className="block text-sm font-semibold mb-2">Estado de Pago</label>
                <Dropdown
                  value={paymentStatus}
                  options={paymentStatusOptions}
                  onChange={(e) => setPaymentStatus(e.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-wrap gap-2">
            <Button
              label="✏️ Editar Pedido"
              icon="pi pi-pencil"
              className="p-button-outlined"
              onClick={() => setEditMode(!editMode)}
            />

            <Button
              label="✅ Marcar como Entregado"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleMarkAsDelivered}
              disabled={deliveryStatus === 'entregado'}
            />

            <Button
              label="💰 Registrar Pago"
              icon="pi pi-wallet"
              className="p-button-warning"
              onClick={handleRegisterPayment}
            />

            {!client.hasCompleteData ? (
              <Button
                label="📄 Descargar Remito PDF"
                icon="pi pi-file-pdf"
                className="p-button-secondary"
                onClick={handleDownloadRemito}
              />
            ) : (
              <Button
                label="📄 Generar Factura"
                icon="pi pi-file"
                className="p-button-info"
                onClick={handleGenerateInvoice}
                disabled={paymentStatus !== 'pagado'}
              />
            )}
          </div>

          {!client.hasCompleteData && (
            <div className="mt-3 p-3 bg-yellow-50 border-round">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-exclamation-triangle text-warning"></i>
                <span className="font-semibold">Datos fiscales incompletos</span>
              </div>
              <p className="text-sm m-0">
                Este cliente no tiene todos los datos fiscales. Se generará un REMITO.
                El administrador deberá facturar posteriormente.
              </p>
            </div>
          )}
        </div>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        order={order}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
};

export default OrderDetailModal;
