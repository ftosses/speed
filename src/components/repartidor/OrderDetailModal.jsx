import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { formatCurrency } from '../../utils/helpers';
import { mockClients } from '../../services/mockData';

const OrderDetailModal = ({ visible, onHide, order: propOrder }) => {
  // State management
  const [order, setOrder] = useState(propOrder);
  const [editedItems, setEditedItems] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paidFullAmount, setPaidFullAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [comments, setComments] = useState('');
  const [showRemitoButton, setShowRemitoButton] = useState(false);

  useEffect(() => {
    if (propOrder) {
      setOrder(propOrder);
      setEditedItems(propOrder.items ? [...propOrder.items] : []);
      setDeliveryDate(propOrder.createdAt ? new Date(propOrder.createdAt) : new Date());
      setDeliveryStatus('');
      setPaymentMethod('');
      setPaidFullAmount('');
      setDiscountPercent(0);
      setComments(propOrder.notes || '');
      setShowRemitoButton(false);
    }
  }, [propOrder]);

  // Handle payment flow completion
  useEffect(() => {
    if (deliveryStatus === 'entregado' && paymentMethod) {
      if (paymentMethod === 'efectivo') {
        setShowRemitoButton(true);
      } else if (paymentMethod === 'eft_trans' && paidFullAmount) {
        setShowRemitoButton(true);
      } else if (paymentMethod === 'eft_trans' && !paidFullAmount) {
        // EFT/TRANS selected but payment confirmation not yet completed
        setShowRemitoButton(false);
      } else if (paymentMethod === 'no_pago') {
        setShowRemitoButton(false);
      } else {
        // Any other case - hide button
        setShowRemitoButton(false);
      }
    } else {
      setShowRemitoButton(false);
    }
  }, [deliveryStatus, paymentMethod, paidFullAmount]);

  if (!order) return null;

  // Get client info
  const client = mockClients.find(c => c.id === order.clientId) || {
    name: order.clientName,
    address: order.clientAddress,
    phone: '11-0000-0000'
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return editedItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discountPercent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  // Handle quantity changes
  const handleQuantityChange = (index, delta) => {
    const newItems = [...editedItems];
    const newQuantity = Math.max(0, newItems[index].quantity + delta);
    newItems[index].quantity = newQuantity;
    newItems[index].subtotal = newQuantity * newItems[index].pricePerUnit;
    setEditedItems(newItems);
  };

  // Handle price changes
  const handlePriceChange = (index, value) => {
    const newItems = [...editedItems];
    newItems[index].pricePerUnit = value || 0;
    newItems[index].subtotal = newItems[index].quantity * newItems[index].pricePerUnit;
    setEditedItems(newItems);
  };

  const handleDownloadRemito = () => {
    console.log('Descargando remito...');
    alert('Remito descargado exitosamente');
    // Simulate PDF download
    // window.open('/mock-remito.pdf', '_blank');
  };

  const handleSaveChanges = () => {
    const updatedOrder = {
      ...order,
      items: editedItems,
      createdAt: deliveryDate.toISOString(),
      status: deliveryStatus === 'entregado' ? 'entregado' : 'consignacion',
      paymentStatus: paymentMethod === 'no_pago' ? 'no_pago' : 'pagado',
      paymentMethod: paymentMethod,
      discountPercent: discountPercent,
      discount: calculateDiscount(),
      total: calculateTotal(),
      notes: comments
    };

    console.log('Guardando cambios:', updatedOrder);
    alert('Pedido actualizado exitosamente');
    onHide();
  };

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(client.address)}&output=embed`;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-shopping-cart text-2xl" style={{ color: '#E31E24' }}></i>
          <div>
            <div className="font-bold">Pedido {order.orderNumber}</div>
            <div className="text-sm font-normal text-gray-600">{order.clientName}</div>
          </div>
        </div>
      }
      style={{ width: '100vw', height: '100vh', margin: 0 }}
      contentStyle={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
      maximized
      modal
    >
      <div className="p-fluid">
        {/* SECTION 1 - CLIENT INFO */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-3 flex align-items-center gap-2">
            <i className="pi pi-user" style={{ color: '#E31E24' }}></i>
            Información del Cliente
          </h3>
          <div className="grid mb-3">
            <div className="col-12 md:col-6">
              <div className="mb-2">
                <strong>Nombre:</strong> {client.name}
              </div>
              <div className="mb-2">
                <strong>Dirección:</strong> {client.address}
              </div>
              <div className="mb-2">
                <strong>Teléfono:</strong> {client.phone}
              </div>
            </div>
            <div className="col-12 md:col-6">
              <div className="flex justify-content-between align-items-center mb-2">
                <strong>📍 Ubicación</strong>
                <Button
                  label="Abrir en Google Maps"
                  icon="pi pi-map"
                  className="p-button-sm p-button-outlined p-button-success"
                  onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(client.address)}`, '_blank')}
                />
              </div>
              <iframe
                width="100%"
                height="250"
                frameBorder="0"
                src={mapsEmbedUrl}
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                title="Ubicación del cliente"
              ></iframe>
            </div>
          </div>
        </div>

        <Divider />

        {/* SECTION 2 - ORDER DETAILS */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-3 flex align-items-center gap-2">
            <i className="pi pi-box" style={{ color: '#E31E24' }}></i>
            Detalles del Pedido
          </h3>
          {editedItems.map((item, index) => (
            <div key={index} className="grid mb-3 p-3 border-1 border-gray-300 border-round">
              <div className="col-12 md:col-5">
                <strong>{item.productName}</strong>
              </div>
              <div className="col-12 md:col-3">
                <label className="block mb-2 text-sm">Cantidad</label>
                <div className="flex align-items-center gap-2">
                  <Button
                    icon="pi pi-minus"
                    className="p-button-rounded p-button-sm p-button-danger"
                    onClick={() => handleQuantityChange(index, -1)}
                  />
                  <InputNumber
                    value={item.quantity}
                    onValueChange={(e) => {
                      const newItems = [...editedItems];
                      newItems[index].quantity = e.value || 0;
                      newItems[index].subtotal = newItems[index].quantity * newItems[index].pricePerUnit;
                      setEditedItems(newItems);
                    }}
                    min={0}
                    className="w-full"
                  />
                  <Button
                    icon="pi pi-plus"
                    className="p-button-rounded p-button-sm p-button-success"
                    onClick={() => handleQuantityChange(index, 1)}
                  />
                </div>
              </div>
              <div className="col-12 md:col-2">
                <label className="block mb-2 text-sm">Precio Unit.</label>
                <InputNumber
                  value={item.pricePerUnit}
                  onValueChange={(e) => handlePriceChange(index, e.value)}
                  mode="currency"
                  currency="ARS"
                  locale="es-AR"
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-2">
                <label className="block mb-2 text-sm">Subtotal</label>
                <div className="text-xl font-bold">{formatCurrency(item.subtotal)}</div>
              </div>
            </div>
          ))}

          <div className="grid mt-3">
            <div className="col-12 text-right">
              <div className="text-lg mb-2">
                <strong>Subtotal:</strong> {formatCurrency(calculateSubtotal())}
              </div>
              {discountPercent > 0 && (
                <div className="text-lg mb-2 text-orange-500">
                  <strong>Descuento ({discountPercent}%):</strong> -{formatCurrency(calculateDiscount())}
                </div>
              )}
              <div className="text-2xl font-bold" style={{ color: '#E31E24' }}>
                <strong>Total:</strong> {formatCurrency(calculateTotal())}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* SECTION 3 - DELIVERY DATE */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-3 flex align-items-center gap-2">
            <i className="pi pi-calendar" style={{ color: '#E31E24' }}></i>
            Fecha de Entrega
          </h3>
          <Calendar
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            showTime
            hourFormat="24"
            className="w-full md:w-6"
          />
        </div>

        <Divider />

        {/* SECTION 4 - DELIVERY STATUS */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-3 flex align-items-center gap-2">
            <i className="pi pi-check-circle" style={{ color: '#E31E24' }}></i>
            Estado de la Entrega
          </h3>
          <div className="grid">
            <div className="col-12 md:col-6 flex align-items-center">
              <RadioButton
                inputId="entregado"
                name="deliveryStatus"
                value="entregado"
                onChange={(e) => {
                  setDeliveryStatus(e.value);
                  setPaymentMethod('');
                  setPaidFullAmount('');
                  setDiscountPercent(0);
                  setShowRemitoButton(false);
                }}
                checked={deliveryStatus === 'entregado'}
              />
              <label htmlFor="entregado" className="ml-2 text-lg cursor-pointer">
                ✅ Entregado/Pagado
              </label>
            </div>
            <div className="col-12 md:col-6 flex align-items-center">
              <RadioButton
                inputId="consignacion"
                name="deliveryStatus"
                value="consignacion"
                onChange={(e) => {
                  setDeliveryStatus(e.value);
                  setPaymentMethod('');
                  setPaidFullAmount('');
                  setDiscountPercent(0);
                  setShowRemitoButton(false);
                }}
                checked={deliveryStatus === 'consignacion'}
              />
              <label htmlFor="consignacion" className="ml-2 text-lg cursor-pointer">
                📦 Consignación
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 5 - PAYMENT FLOW (only if Entregado/Pagado) */}
        {deliveryStatus === 'entregado' && (
          <>
            <Divider />
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-3 flex align-items-center gap-2">
                <i className="pi pi-wallet" style={{ color: '#E31E24' }}></i>
                Método de Pago
              </h3>

              {/* Step 1 - Payment Method */}
              <div className="grid mb-3">
                <div className="col-12 md:col-4 flex align-items-center">
                  <RadioButton
                    inputId="efectivo"
                    name="paymentMethod"
                    value="efectivo"
                    onChange={(e) => {
                      setPaymentMethod(e.value);
                      setPaidFullAmount('');
                      setDiscountPercent(0);
                    }}
                    checked={paymentMethod === 'efectivo'}
                  />
                  <label htmlFor="efectivo" className="ml-2 text-lg cursor-pointer">
                    💵 Efectivo
                  </label>
                </div>
                <div className="col-12 md:col-4 flex align-items-center">
                  <RadioButton
                    inputId="eft_trans"
                    name="paymentMethod"
                    value="eft_trans"
                    onChange={(e) => {
                      setPaymentMethod(e.value);
                      setPaidFullAmount('');
                      setDiscountPercent(0);
                    }}
                    checked={paymentMethod === 'eft_trans'}
                  />
                  <label htmlFor="eft_trans" className="ml-2 text-lg cursor-pointer">
                    🏦 EFT/TRANS
                  </label>
                </div>
                <div className="col-12 md:col-4 flex align-items-center">
                  <RadioButton
                    inputId="no_pago"
                    name="paymentMethod"
                    value="no_pago"
                    onChange={(e) => {
                      setPaymentMethod(e.value);
                      setPaidFullAmount('');
                      setDiscountPercent(0);
                    }}
                    checked={paymentMethod === 'no_pago'}
                  />
                  <label htmlFor="no_pago" className="ml-2 text-lg cursor-pointer">
                    ⏳ No pagó hoy
                  </label>
                </div>
              </div>

              {/* Step 2 - If EFT/TRANS selected */}
              {paymentMethod === 'eft_trans' && (
                <div className="mt-4 p-3 bg-blue-50 border-round">
                  <h4 className="mb-3">¿Pagó el total?</h4>
                  <div className="grid">
                    <div className="col-12 md:col-6 flex align-items-center">
                      <RadioButton
                        inputId="paid_full"
                        name="paidFullAmount"
                        value="yes"
                        onChange={(e) => {
                          setPaidFullAmount(e.value);
                          setDiscountPercent(0);
                        }}
                        checked={paidFullAmount === 'yes'}
                      />
                      <label htmlFor="paid_full" className="ml-2 cursor-pointer">
                        ✅ Sí, pagó el total
                      </label>
                    </div>
                    <div className="col-12 md:col-6 flex align-items-center">
                      <RadioButton
                        inputId="paid_discount"
                        name="paidFullAmount"
                        value="no"
                        onChange={(e) => setPaidFullAmount(e.value)}
                        checked={paidFullAmount === 'no'}
                      />
                      <label htmlFor="paid_discount" className="ml-2 cursor-pointer">
                        💰 No, le hice descuento
                      </label>
                    </div>
                  </div>

                  {/* Step 3a - Paid full */}
                  {paidFullAmount === 'yes' && (
                    <div className="mt-3 p-3 bg-green-50 border-round">
                      <i className="pi pi-check-circle mr-2" style={{ color: '#22C55E' }}></i>
                      <strong style={{ color: '#22C55E' }}>¡Pago completo registrado!</strong>
                    </div>
                  )}

                  {/* Step 3b - Discount applied */}
                  {paidFullAmount === 'no' && (
                    <div className="mt-3 p-3 bg-orange-50 border-round">
                      <label htmlFor="discount" className="block mb-2 font-bold">
                        Descuento aplicado (%)
                      </label>
                      <InputNumber
                        id="discount"
                        value={discountPercent}
                        onValueChange={(e) => setDiscountPercent(e.value || 0)}
                        min={0}
                        max={100}
                        suffix="%"
                        className="w-full md:w-6"
                      />
                      <div className="mt-3 text-xl">
                        <strong>Nuevo total: </strong>
                        <span className="font-bold" style={{ color: '#E31E24' }}>
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Download Remito Button */}
              {showRemitoButton && (
                <div className="mt-4 text-center">
                  <Button
                    label="📄 Descargar Remito"
                    icon="pi pi-download"
                    className="p-button-lg p-button-success"
                    onClick={handleDownloadRemito}
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Divider />

        {/* SECTION 6 - COMMENTS */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-3 flex align-items-center gap-2">
            <i className="pi pi-comment" style={{ color: '#E31E24' }}></i>
            Observaciones
          </h3>
          <InputTextarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="Observaciones sobre la entrega..."
            className="w-full"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            label="Guardar Cambios"
            icon="pi pi-check"
            className="p-button-danger p-button-lg"
            onClick={handleSaveChanges}
            disabled={!deliveryStatus || (deliveryStatus === 'entregado' && !paymentMethod)}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default OrderDetailModal;
