import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { mockRepartidores, mockOrders } from '../../services/mockData';
import { ZONES, ORDER_STATUS, ORDER_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Rutas = () => {
  const { selectedZone } = useZone();
  const [routesData, setRoutesData] = useState([]);

  useEffect(() => {
    let filteredRepartidores = mockRepartidores;

    if (selectedZone) {
      filteredRepartidores = filteredRepartidores.filter(r => r.zone === selectedZone.id);
    }

    // Build routes data for each repartidor
    const routes = filteredRepartidores.map(repartidor => {
      const orders = mockOrders.filter(o => o.repartidorId === repartidor.id);
      const completedOrders = orders.filter(o => o.status === ORDER_STATUS.ENTREGADO);
      const zone = Object.values(ZONES).find(z => z.id === repartidor.zone);

      return {
        ...repartidor,
        zone: zone,
        orders,
        completedOrders: completedOrders.length,
        totalOrders: orders.length,
        progress: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0
      };
    });

    setRoutesData(routes);
  }, [selectedZone]);

  const getStatusIcon = (status) => {
    const icons = {
      [ORDER_STATUS.PENDIENTE]: '⏳',
      [ORDER_STATUS.EN_RUTA]: '🚚',
      [ORDER_STATUS.ENTREGADO]: '✅',
      [ORDER_STATUS.DEVOLUCION_PARCIAL]: '⚠️',
      [ORDER_STATUS.CANCELADO]: '❌',
      [ORDER_STATUS.CONSIGNACION]: '📦'
    };
    return icons[status] || '📋';
  };

  const getStatusSeverity = (status) => {
    const severities = {
      [ORDER_STATUS.PENDIENTE]: 'secondary',
      [ORDER_STATUS.EN_RUTA]: 'info',
      [ORDER_STATUS.ENTREGADO]: 'success',
      [ORDER_STATUS.DEVOLUCION_PARCIAL]: 'warning',
      [ORDER_STATUS.CANCELADO]: 'danger',
      [ORDER_STATUS.CONSIGNACION]: 'info'
    };
    return severities[status] || 'secondary';
  };

  const handleViewOrder = (orderId) => {
    console.log('Ver pedido:', orderId);
  };

  const handleNavigate = (address) => {
    console.log('Navegar a:', address);
  };

  if (routesData.length === 0) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">🚚 Rutas del Día</h1>
          <p className="text-gray-600">
            Seguimiento en tiempo real de las rutas de entrega
          </p>
        </div>
        <Card>
          <div className="text-center py-5">
            <i className="pi pi-inbox text-6xl text-gray-400 mb-3"></i>
            <p className="text-xl text-gray-600">
              No hay rutas activas para la zona seleccionada
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">🚚 Rutas del Día</h1>
        <p className="text-gray-600">
          Seguimiento en tiempo real de las rutas de entrega
        </p>
      </div>

      <div className="grid">
        {routesData.map((route) => (
          <div key={route.id} className="col-12 mb-3">
            <Card>
              <div className="flex justify-content-between align-items-start mb-3">
                <div className="flex align-items-center gap-3">
                  <div className="flex align-items-center justify-content-center bg-gray-100"
                       style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                    <i className="pi pi-user text-3xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold m-0">{route.name}</h2>
                    <div className="flex gap-2 align-items-center mt-2">
                      <Tag
                        value={route.zone?.name}
                        style={{ backgroundColor: route.zone?.color }}
                      />
                      <span className="text-gray-600">{route.vehicleType}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-2">
                    {route.completedOrders}/{route.totalOrders} ✅
                  </div>
                  <div className="text-sm text-gray-600">
                    {route.progress.toFixed(0)}% completado
                  </div>
                </div>
              </div>

              <div className="grid mb-3">
                <div className="col-6 md:col-3">
                  <div className="text-sm text-gray-600">Cobrado Hoy</div>
                  <div className="text-xl font-bold text-success">
                    {formatCurrency(route.collectedToday)}
                  </div>
                </div>
                <div className="col-6 md:col-3">
                  <div className="text-sm text-gray-600">Pendientes</div>
                  <div className="text-xl font-bold text-warning">
                    {route.orders.filter(o => o.status === ORDER_STATUS.PENDIENTE).length}
                  </div>
                </div>
                <div className="col-6 md:col-3">
                  <div className="text-sm text-gray-600">En Ruta</div>
                  <div className="text-xl font-bold text-info">
                    {route.orders.filter(o => o.status === ORDER_STATUS.EN_RUTA).length}
                  </div>
                </div>
                <div className="col-6 md:col-3">
                  <div className="text-sm text-gray-600">Entregados</div>
                  <div className="text-xl font-bold text-success">
                    {route.completedOrders}
                  </div>
                </div>
              </div>

              <Accordion multiple>
                <AccordionTab header={`📋 Ver Pedidos (${route.orders.length})`}>
                  <div className="grid">
                    {route.orders.map((order) => (
                      <div key={order.id} className="col-12 mb-2">
                        <Card className="shadow-1">
                          <div className="flex justify-content-between align-items-start">
                            <div className="flex-1">
                              <div className="flex align-items-center gap-2 mb-2">
                                <span className="font-mono font-semibold">#{order.id}</span>
                                <Tag
                                  value={`${getStatusIcon(order.status)} ${ORDER_STATUS_LABELS[order.status]}`}
                                  severity={getStatusSeverity(order.status)}
                                />
                              </div>
                              <h3 className="text-xl font-bold mb-2">{order.clientName}</h3>
                              <p className="text-gray-600 mb-2">
                                <i className="pi pi-map-marker mr-2"></i>
                                {order.clientAddress}
                              </p>
                              {order.notes && (
                                <p className="text-sm text-gray-500 mb-2">
                                  <i className="pi pi-info-circle mr-2"></i>
                                  {order.notes}
                                </p>
                              )}
                              <div className="flex gap-3 mt-2">
                                <span className="text-sm">
                                  <strong>Items:</strong> {order.items.length}
                                </span>
                                {order.total > 0 && (
                                  <span className="text-sm font-semibold">
                                    <strong>Total:</strong> {formatCurrency(order.total)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-column gap-2 ml-3">
                              <Button
                                icon="pi pi-eye"
                                className="action-button"
                                tooltip="Ver detalle"
                                tooltipOptions={{ position: 'left' }}
                                onClick={() => handleViewOrder(order.id)}
                              />
                              <Button
                                icon="pi pi-map"
                                className="action-button"
                                tooltip="Navegar"
                                tooltipOptions={{ position: 'left' }}
                                onClick={() => handleNavigate(order.clientAddress)}
                              />
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </AccordionTab>
              </Accordion>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rutas;
