import React, { useState, useMemo } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { mockOrders, mockRepartidores, mockClients, mockPagos } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { isToday, isTomorrow } from '../../utils/dateHelpers';
import OrderDetailModal from './OrderDetailModal';

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get current repartidor data (mock)
  const repartidor = mockRepartidores.find(r => r.id === user.id) || mockRepartidores[0];

  // Get all orders for this repartidor and add date field
  const myOrders = mockOrders
    .filter(order => order.repartidorId === repartidor.id)
    .map(order => ({
      ...order,
      date: order.createdAt || order.date || new Date().toISOString()
    }));

  // Filter orders by date
  const ordersToday = useMemo(() =>
    myOrders.filter(order => isToday(order.date)),
    [myOrders]
  );

  const ordersTomorrow = useMemo(() =>
    myOrders.filter(order => isTomorrow(order.date)),
    [myOrders]
  );

  // Get clients with debt (deudaTotal > 0)
  const clientsWithDebt = useMemo(() => {
    return mockClients.filter(client => client.deudaTotal > 0);
  }, []);

  // Get payments collected today by this repartidor
  const paymentsToday = useMemo(() => {
    return mockPagos.filter(pago => {
      const pagoDate = new Date(pago.fecha);
      return pago.repartidorId === repartidor.id && isToday(pagoDate);
    });
  }, [repartidor.id]);

  const totalCollectedToday = useMemo(() => {
    return paymentsToday.reduce((sum, pago) => sum + pago.monto, 0);
  }, [paymentsToday]);

  const handleOrderClick = (order) => {
    // Get client data
    const client = mockClients.find(c => c.id === order.clientId);
    setSelectedOrder({ ...order, client });
    setShowOrderModal(true);
  };

  const handleModalClose = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const getStatusIcon = (status) => {
    const icons = {
      entregado: '✅',
      pendiente: '⏳',
      en_ruta: '🚚',
      'no_entregado': '❌',
      consignacion: '📦'
    };
    return icons[status] || '⏳';
  };

  const getPaymentStatusIcon = (paymentStatus) => {
    const icons = {
      pagado: '✅',
      pendiente: '⏳',
      'no_pago': '❌'
    };
    return icons[paymentStatus] || '⏳';
  };

  return (
    <div className="p-3">
      {/* Greeting Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold" style={{ color: '#E31E24' }}>
          Hola, {repartidor.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Bar */}
      <Card className="mb-3">
        <div className="grid">
          <div className="col-6">
            <div className="text-sm text-gray-600">Entregas</div>
            <div className="text-2xl font-bold">
              {repartidor.deliveriesToday}/{repartidor.totalDeliveries} ✅
            </div>
          </div>
          <div className="col-6">
            <div className="text-sm text-gray-600">Cobrado Hoy</div>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(repartidor.collectedToday)}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Button */}
      <div className="flex justify-content-end mb-3">
        <Button
          label="Seleccionar Fecha"
          icon="pi pi-calendar"
          className="p-button-outlined"
          onClick={() => setShowCalendar(true)}
        />
      </div>

      {/* Tabs for date filtering */}
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header={`HOY (${ordersToday.length})`}>
          <div className="mt-2">
            {ordersToday.length === 0 ? (
              <Card>
                <div className="text-center py-4">
                  <i className="pi pi-check-circle text-6xl text-success mb-3"></i>
                  <h3>¡Todo listo!</h3>
                  <p className="text-gray-600">No tienes entregas para hoy.</p>
                </div>
              </Card>
            ) : (
              ordersToday.map((order) => (
                <Card
                  key={order.id}
                  className="mb-3 cursor-pointer hover:shadow-4 transition-duration-200"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="flex align-items-start justify-content-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        #{order.id} - {order.clientName}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        <i className="pi pi-map-marker mr-2" style={{ color: '#E31E24' }}></i>
                        {order.clientAddress}
                      </p>
                      {order.notes && (
                        <p className="text-sm text-gray-500 mb-2">
                          <i className="pi pi-info-circle mr-2"></i>
                          {order.notes}
                        </p>
                      )}
                      <div className="flex gap-2 mb-2">
                        <div className="text-sm">
                          <strong>Entrega:</strong> {getStatusIcon(order.status)} {order.status}
                        </div>
                        <div className="text-sm">
                          <strong>Pago:</strong> {getPaymentStatusIcon(order.paymentStatus)} {order.paymentStatus}
                        </div>
                      </div>
                      {order.total > 0 && (
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.total)}
                        </p>
                      )}
                    </div>
                    <i className="pi pi-chevron-right text-2xl text-gray-400"></i>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabPanel>

        <TabPanel header={`MAÑANA (${ordersTomorrow.length})`}>
          <div className="mt-2">
            {ordersTomorrow.length === 0 ? (
              <Card>
                <div className="text-center py-4">
                  <i className="pi pi-calendar text-6xl text-gray-400 mb-3"></i>
                  <h3>Sin entregas</h3>
                  <p className="text-gray-600">No hay entregas programadas para mañana.</p>
                </div>
              </Card>
            ) : (
              ordersTomorrow.map((order) => (
                <Card
                  key={order.id}
                  className="mb-3 cursor-pointer hover:shadow-4 transition-duration-200"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="flex align-items-start justify-content-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        #{order.id} - {order.clientName}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        <i className="pi pi-map-marker mr-2" style={{ color: '#E31E24' }}></i>
                        {order.clientAddress}
                      </p>
                      {order.total > 0 && (
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(order.total)}
                        </p>
                      )}
                    </div>
                    <i className="pi pi-chevron-right text-2xl text-gray-400"></i>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabPanel>

        <TabPanel header={`DEUDAS DEL DÍA (${clientsWithDebt.length})`}>
          <div className="mt-2">
            {clientsWithDebt.length === 0 ? (
              <Card>
                <div className="text-center py-4">
                  <i className="pi pi-check-circle text-6xl text-success mb-3"></i>
                  <h3>¡Sin deudas!</h3>
                  <p className="text-gray-600">No hay clientes con deuda pendiente.</p>
                </div>
              </Card>
            ) : (
              clientsWithDebt.map((client) => (
                <Card
                  key={client.id}
                  className="mb-3"
                >
                  <div className="flex align-items-start justify-content-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {client.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        <i className="pi pi-map-marker mr-2" style={{ color: '#E31E24' }}></i>
                        {client.address}
                      </p>
                      <div className="flex align-items-center gap-2">
                        <span className="text-sm text-gray-600">Deuda Total:</span>
                        <span className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                          {formatCurrency(client.deudaTotal)}
                        </span>
                      </div>
                      {client.desgloseBajadas && client.desgloseBajadas.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {client.desgloseBajadas.length} bajada{client.desgloseBajadas.length !== 1 ? 's' : ''} pendiente{client.desgloseBajadas.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabPanel>

        <TabPanel header={`COBRADOS HOY (${paymentsToday.length})`}>
          <div className="mt-2">
            {paymentsToday.length === 0 ? (
              <Card>
                <div className="text-center py-4">
                  <i className="pi pi-wallet text-6xl text-gray-400 mb-3"></i>
                  <h3>Sin cobros registrados</h3>
                  <p className="text-gray-600">No hay cobros registrados para hoy.</p>
                </div>
              </Card>
            ) : (
              <>
                <Card className="mb-3" style={{ backgroundColor: '#F0FDF4' }}>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Cobrado Hoy</div>
                    <div className="text-3xl font-bold text-success">
                      {formatCurrency(totalCollectedToday)}
                    </div>
                  </div>
                </Card>
                {paymentsToday.map((pago) => (
                  <Card
                    key={pago.id}
                    className="mb-3"
                  >
                    <div className="flex align-items-start justify-content-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          {pago.clienteName}
                        </h3>
                        <div className="flex flex-column gap-2">
                          <div className="text-sm">
                            <i className="pi pi-clock mr-2"></i>
                            <strong>Hora:</strong> {pago.hora}
                          </div>
                          <div className="text-sm">
                            <i className="pi pi-credit-card mr-2"></i>
                            <strong>Método:</strong> {pago.metodo}
                          </div>
                          {pago.notas && (
                            <div className="text-sm text-gray-600">
                              <i className="pi pi-info-circle mr-2"></i>
                              {pago.notas}
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-success">
                            {formatCurrency(pago.monto)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabPanel>
      </TabView>

      {/* Calendar Dialog */}
      <Dialog
        visible={showCalendar}
        onHide={() => setShowCalendar(false)}
        header="Seleccionar Fecha"
        style={{ width: '400px' }}
      >
        <div className="flex flex-column align-items-center">
          <Calendar
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.value)}
            inline
            dateFormat="dd/mm/yy"
          />
          <div className="mt-3 w-full">
            <Button
              label="Ver Entregas"
              icon="pi pi-check"
              className="w-full"
              onClick={() => {
                console.log('Ver entregas para:', selectedDate);
                setShowCalendar(false);
              }}
            />
          </div>
        </div>
      </Dialog>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          visible={showOrderModal}
          onHide={handleModalClose}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default Home;
