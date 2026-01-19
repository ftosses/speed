import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { useAuth } from '../../context/AuthContext';
import { mockClients, mockOrders } from '../../services/mockData';
import { ZONES, PRODUCTS, PRICE_LISTS, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import OrderDetailModal from '../../components/repartidor/OrderDetailModal';

const RepartidorClientes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter state
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [debtFilter, setDebtFilter] = useState(null);

  // New order state
  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Payment state
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Get repartidor's assigned zone (mock: Juan = Zona Sur, Pedro = San Telmo)
  const myZone = user.id === 1 ? ZONES.SUR.id : ZONES.SAN_TELMO.id;

  // Filter clients by repartidor's zone
  let myClients = mockClients.filter(client => client.zone === myZone);

  // Apply payment status filter
  if (paymentStatusFilter) {
    myClients = myClients.filter(client => client.estadoPago === paymentStatusFilter);
  }

  // Apply debt filter
  if (debtFilter === 'with_debt') {
    myClients = myClients.filter(client => client.deudaTotal > 0);
  } else if (debtFilter === 'no_debt') {
    myClients = myClients.filter(client => client.deudaTotal === 0);
  }

  // Filter by search term
  const filteredClients = myClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowDetailDialog(true);
  };

  const handleCargarPedido = (client) => {
    setSelectedClient(client);
    setOrderItems([]);
    setOrderNotes('');
    setShowDetailDialog(false);
    setShowNewOrderDialog(true);
  };

  const handleAddProduct = () => {
    const newItem = {
      productId: null,
      productName: '',
      quantity: 1,
      pricePerUnit: 0,
      priceList: selectedClient?.priceList || PRICE_LISTS.LISTA_B,
      subtotal: 0
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleRemoveProduct = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleProductChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;

    // If product is selected, update related fields
    if (field === 'productId' && value) {
      const product = PRODUCTS.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        const priceList = selectedClient?.priceList || PRICE_LISTS.LISTA_B;
        newItems[index].pricePerUnit = product.prices[priceList] || 0;
      }
    }

    // Recalculate subtotal
    newItems[index].subtotal = newItems[index].quantity * newItems[index].pricePerUnit;

    setOrderItems(newItems);
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSaveOrder = () => {
    if (orderItems.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    const newOrder = {
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientAddress: selectedClient.address,
      zone: selectedClient.zone,
      repartidorId: user.id,
      repartidorName: user.name,
      items: orderItems,
      total: calculateOrderTotal(),
      notes: orderNotes,
      createdAt: new Date().toISOString()
    };

    console.log('Guardando nuevo pedido:', newOrder);
    alert('Pedido cargado exitosamente');
    setShowNewOrderDialog(false);
    setOrderItems([]);
    setOrderNotes('');
  };

  const handleCargarPago = (client) => {
    setSelectedClient(client);
    setPaymentDate(new Date());
    setPaymentAmount(client.deudaTotal || 0);
    setPaymentMethod('');
    setPaymentNotes('');
    setShowDetailDialog(false);
    setShowPaymentDialog(true);
  };

  const handleSavePayment = () => {
    if (!paymentMethod) {
      alert('Debe seleccionar un método de pago');
      return;
    }

    if (paymentAmount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    const newPayment = {
      fecha: paymentDate.toISOString(),
      hora: paymentDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      clienteId: selectedClient.id,
      clienteName: selectedClient.name,
      monto: paymentAmount,
      metodo: paymentMethod,
      repartidorId: user.id,
      repartidorName: user.name,
      notas: paymentNotes
    };

    console.log('Registrando pago:', newPayment);
    alert('Pago registrado exitosamente');
    setShowPaymentDialog(false);
  };

  const handleOrderClick = (order) => {
    const client = mockClients.find(c => c.id === order.clientId);
    setSelectedOrder({ ...order, client });
    setShowOrderDetailModal(true);
  };

  // Get client's recent orders
  const getClientOrders = (clientId) => {
    return mockOrders
      .filter(order => order.clientId === clientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // Product options for dropdown
  const productOptions = PRODUCTS.map(p => {
    const priceList = selectedClient?.priceList || PRICE_LISTS.LISTA_B;
    return {
      label: `${p.name} - ${formatCurrency(p.prices[priceList])}`,
      value: p.id
    };
  });

  return (
    <div className="p-3">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">👥 Mis Clientes</h1>
        <p className="text-gray-600">
          {myClients.length} clientes en tu zona
        </p>
      </div>

      <div className="mb-3">
        <span className="p-input-icon-left w-full mb-2">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full"
          />
        </span>
        <div className="flex gap-2 flex-wrap mt-2">
          <Dropdown
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.value)}
            options={[
              { label: 'Todos los estados', value: null },
              { label: 'Pagado', value: 'Pagado' },
              { label: 'Pendiente', value: 'Pendiente' },
              { label: 'Deudor', value: 'Deudor' }
            ]}
            placeholder="Filtrar por estado de pago"
            showClear={!!paymentStatusFilter}
            className="flex-1"
          />
          <Dropdown
            value={debtFilter}
            onChange={(e) => setDebtFilter(e.value)}
            options={[
              { label: 'Todos', value: null },
              { label: 'Con deuda', value: 'with_debt' },
              { label: 'Sin deuda', value: 'no_debt' }
            ]}
            placeholder="Filtrar por deuda"
            showClear={!!debtFilter}
            className="flex-1"
          />
        </div>
      </div>

      <div className="grid">
        {filteredClients.map((client) => {
          const zone = Object.values(ZONES).find(z => z.id === client.zone);
          const isPositive = client.currentBalance >= 0;

          return (
            <div key={client.id} className="col-12 sm:col-6 md:col-4 mb-3">
              <Card
                className="cursor-pointer hover:shadow-4 transition-duration-200"
                onClick={() => handleClientClick(client)}
              >
                <div className="mb-2">
                  <h3 className="text-xl font-bold mb-1">{client.name}</h3>
                  <Tag
                    value={zone?.name}
                    style={{ backgroundColor: zone?.color }}
                    className="mb-2"
                  />
                </div>

                <p className="text-gray-600 mb-2">
                  <i className="pi pi-map-marker mr-2"></i>
                  {client.address}
                </p>

                <div className="flex justify-content-between align-items-center mt-3 pt-3 border-top-1 border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">Saldo</div>
                    <div className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(Math.abs(client.currentBalance))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Última compra</div>
                    <div className="text-sm font-semibold">
                      {client.lastPurchase ? formatDate(client.lastPurchase) : 'Sin compras'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card className="text-center py-5">
          <i className="pi pi-inbox text-6xl text-gray-400 mb-3"></i>
          <p className="text-xl text-gray-600">No se encontraron clientes</p>
        </Card>
      )}

      {/* Client Detail Dialog */}
      <Dialog
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-user text-2xl"></i>
            <span>Detalle del Cliente</span>
          </div>
        }
        visible={showDetailDialog}
        onHide={() => setShowDetailDialog(false)}
        style={{ width: '700px', maxWidth: '95vw' }}
        modal
        dismissableMask
      >
        {selectedClient && (
          <div>
            <div className="mb-4 pb-3 border-bottom-1 border-gray-200">
              <h2 className="text-2xl font-bold mb-2">{selectedClient.name}</h2>
              <div className="grid">
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Dirección</div>
                  <div className="font-semibold">
                    <i className="pi pi-map-marker mr-2"></i>
                    {selectedClient.address}
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Teléfono</div>
                  <div className="font-semibold">
                    <i className="pi pi-phone mr-2"></i>
                    {selectedClient.phone}
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold">
                    <i className="pi pi-envelope mr-2"></i>
                    {selectedClient.email}
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Saldo Actual</div>
                  <div className={`text-2xl font-bold ${selectedClient.currentBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(Math.abs(selectedClient.currentBalance))}
                    {selectedClient.currentBalance < 0 && ' (DEBE)'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h3 className="text-lg font-bold mb-2">Historial de Pedidos</h3>
              {getClientOrders(selectedClient.id).length > 0 ? (
                <div className="grid">
                  {getClientOrders(selectedClient.id).map(order => (
                    <div key={order.id} className="col-12 mb-2">
                      <Card
                        className="shadow-1 cursor-pointer hover:shadow-4 transition-duration-200"
                        onClick={() => handleOrderClick(order)}
                      >
                        <div className="flex justify-content-between align-items-center">
                          <div>
                            <div className="font-semibold">Pedido #{order.id}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(order.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(order.total)}</div>
                            <Tag
                              value={order.status}
                              severity={order.status === 'entregado' ? 'success' : 'warning'}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay pedidos registrados</p>
              )}
            </div>

            <div className="flex gap-2 justify-content-between flex-wrap">
              <div className="flex gap-2">
                <Button
                  label="Cargar Pedido"
                  icon="pi pi-plus-circle"
                  className="p-button-danger"
                  onClick={() => handleCargarPedido(selectedClient)}
                />
                <Button
                  label="Cargar Pago"
                  icon="pi pi-wallet"
                  className="p-button-success"
                  onClick={() => handleCargarPago(selectedClient)}
                  disabled={!selectedClient.deudaTotal || selectedClient.deudaTotal === 0}
                />
              </div>
              <Button
                label="Cerrar"
                icon="pi pi-times"
                className="p-button-secondary"
                onClick={() => setShowDetailDialog(false)}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* New Order Dialog */}
      <Dialog
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-shopping-cart text-2xl" style={{ color: '#E31E24' }}></i>
            <span>Cargar Nuevo Pedido</span>
          </div>
        }
        visible={showNewOrderDialog}
        onHide={() => setShowNewOrderDialog(false)}
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
        maximizable
      >
        {selectedClient && (
          <div className="p-fluid">
            {/* Client Info */}
            <div className="mb-4 p-3 bg-gray-50 border-round">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-user text-xl" style={{ color: '#E31E24' }}></i>
                <h3 className="m-0">{selectedClient.name}</h3>
              </div>
              <div className="text-sm text-gray-600">
                <i className="pi pi-map-marker mr-2"></i>
                {selectedClient.address}
              </div>
              <div className="text-sm mt-2">
                <strong>Lista de Precios:</strong> {selectedClient.priceList}
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-4">
              <div className="flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">📦 Productos del Pedido</h3>
                <Button
                  label="Agregar Producto"
                  icon="pi pi-plus"
                  className="p-button-sm p-button-success"
                  onClick={handleAddProduct}
                />
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 border-round">
                  <i className="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">No hay productos agregados. Usa el botón "Agregar Producto" de arriba para comenzar.</p>
                </div>
              ) : (
                orderItems.map((item, index) => (
                  <div key={index} className="mb-3 p-3 border-1 border-gray-300 border-round">
                    <div className="grid">
                      <div className="col-12 md:col-6 mb-2">
                        <label className="font-bold mb-2 block">Producto</label>
                        <Dropdown
                          value={item.productId}
                          options={productOptions}
                          onChange={(e) => handleProductChange(index, 'productId', e.value)}
                          placeholder="Seleccionar producto"
                          className="w-full"
                        />
                      </div>

                      <div className="col-12 md:col-3 mb-2">
                        <label className="font-bold mb-2 block">Cantidad</label>
                        <InputNumber
                          value={item.quantity}
                          onValueChange={(e) => handleProductChange(index, 'quantity', e.value)}
                          min={1}
                          className="w-full"
                        />
                      </div>

                      <div className="col-12 md:col-3 mb-2">
                        <label className="font-bold mb-2 block">Subtotal</label>
                        <div className="flex align-items-center gap-2 h-full">
                          <span className="font-bold text-lg">{formatCurrency(item.subtotal)}</span>
                          <Button
                            icon="pi pi-trash"
                            className="p-button-danger p-button-sm p-button-text"
                            onClick={() => handleRemoveProduct(index)}
                            tooltip="Eliminar"
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <small className="text-gray-600">
                          Precio unitario: {formatCurrency(item.pricePerUnit)}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {orderItems.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 border-round">
                <div className="flex justify-content-between align-items-center">
                  <h3 className="m-0">Total del Pedido:</h3>
                  <div className="text-3xl font-bold" style={{ color: '#E31E24' }}>
                    {formatCurrency(calculateOrderTotal())}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="orderNotes" className="font-bold mb-2 block">
                📝 Notas / Observaciones
              </label>
              <InputTextarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                placeholder="Agregar notas sobre el pedido (opcional)..."
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-content-end">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowNewOrderDialog(false)}
              />
              <Button
                label="Guardar Pedido"
                icon="pi pi-check"
                className="p-button-danger"
                onClick={handleSaveOrder}
                disabled={orderItems.length === 0}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-wallet text-2xl" style={{ color: '#22C55E' }}></i>
            <span>Cargar Pago</span>
          </div>
        }
        visible={showPaymentDialog}
        onHide={() => setShowPaymentDialog(false)}
        style={{ width: '600px', maxWidth: '95vw' }}
        modal
      >
        {selectedClient && (
          <div className="p-fluid">
            {/* Client Info */}
            <div className="mb-4 p-3 bg-green-50 border-round">
              <h3 className="mb-2">{selectedClient.name}</h3>
              <div className="flex justify-content-between align-items-center">
                <span className="text-gray-700">Deuda Total:</span>
                <span className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                  {formatCurrency(selectedClient.deudaTotal || 0)}
                </span>
              </div>
            </div>

            {/* Payment Date */}
            <div className="mb-4">
              <label htmlFor="paymentDate" className="font-bold mb-2 block">
                📅 Fecha y Hora del Pago
              </label>
              <Calendar
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.value)}
                showIcon
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                className="w-full"
              />
            </div>

            {/* Payment Amount */}
            <div className="mb-4">
              <label htmlFor="paymentAmount" className="font-bold mb-2 block">
                💰 Monto del Pago
              </label>
              <InputNumber
                id="paymentAmount"
                value={paymentAmount}
                onValueChange={(e) => setPaymentAmount(e.value || 0)}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
              />
              {paymentAmount < selectedClient.deudaTotal && paymentAmount > 0 && (
                <small className="text-orange-600 mt-2 block">
                  ⚠️ Pago parcial. Deuda restante: {formatCurrency(selectedClient.deudaTotal - paymentAmount)}
                </small>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label htmlFor="paymentMethod" className="font-bold mb-2 block">
                💳 Método de Pago
              </label>
              <Dropdown
                id="paymentMethod"
                value={paymentMethod}
                options={[
                  { label: 'Seleccionar método...', value: '' },
                  { label: '💵 Efectivo', value: PAYMENT_METHODS.EFECTIVO },
                  { label: '🏦 EFT/Transferencia', value: PAYMENT_METHODS.EFT_TRANS },
                  { label: '💳 Tarjeta', value: PAYMENT_METHODS.TARJETA }
                ]}
                onChange={(e) => setPaymentMethod(e.value)}
                placeholder="Seleccionar método de pago"
                className="w-full"
              />
            </div>

            {/* Payment Notes */}
            <div className="mb-4">
              <label htmlFor="paymentNotes" className="font-bold mb-2 block">
                📝 Observaciones (opcional)
              </label>
              <InputTextarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                placeholder="Agregar notas sobre el pago..."
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-content-end">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowPaymentDialog(false)}
              />
              <Button
                label="Registrar Pago"
                icon="pi pi-check"
                className="p-button-success"
                onClick={handleSavePayment}
                disabled={!paymentMethod || paymentAmount <= 0}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          visible={showOrderDetailModal}
          onHide={() => setShowOrderDetailModal(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default RepartidorClientes;
