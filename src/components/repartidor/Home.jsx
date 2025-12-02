import React, { useState, useMemo } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { mockOrders, mockRepartidores, mockClients } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { isToday, isTomorrow, isThisWeek } from '../../utils/dateHelpers';
import OrderDetailModal from './OrderDetailModal';

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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

  const ordersThisWeek = useMemo(() =>
    myOrders.filter(order => isThisWeek(order.date) && !isToday(order.date) && !isTomorrow(order.date)),
    [myOrders]
  );

  // Get current filtered orders based on active tab
  const getCurrentOrders = () => {
    switch (activeTab) {
      case 0: return ordersToday;
      case 1: return ordersTomorrow;
      case 2: return ordersThisWeek;
      default: return ordersToday;
    }
  };

  const currentOrders = getCurrentOrders();

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

        <TabPanel header={`LA SEMANA (${ordersThisWeek.length})`}>
          <div className="mt-2">
            {ordersThisWeek.length === 0 ? (
              <Card>
                <div className="text-center py-4">
                  <i className="pi pi-calendar text-6xl text-gray-400 mb-3"></i>
                  <h3>Sin entregas</h3>
                  <p className="text-gray-600">No hay más entregas esta semana.</p>
                </div>
              </Card>
            ) : (
              ordersThisWeek.map((order) => (
                <Card
                  key={order.id}
                  className="mb-3 cursor-pointer hover:shadow-4 transition-duration-200"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="flex align-items-start justify-content-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        {new Date(order.date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
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
      </TabView>

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
