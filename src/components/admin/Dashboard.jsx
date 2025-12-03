import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useZone } from '../../context/ZoneContext';
import { mockSalesSummary, mockRecentTransactions, mockOrders } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';
import { isToday, isTomorrow, isThisWeek } from '../../utils/dateHelpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionEstado, setTransactionEstado] = useState('');

  // Filter orders by date and zone
  const allOrders = useMemo(() => {
    return mockOrders.map(order => ({
      ...order,
      date: order.createdAt || order.date || new Date().toISOString()
    }));
  }, []);

  const pedidosHoy = useMemo(() => {
    let filtered = allOrders.filter(order => isToday(order.date));
    if (selectedZone) {
      filtered = filtered.filter(order => order.zone === selectedZone.id);
    }
    return filtered;
  }, [allOrders, selectedZone]);

  const pedidosManana = useMemo(() => {
    let filtered = allOrders.filter(order => isTomorrow(order.date));
    if (selectedZone) {
      filtered = filtered.filter(order => order.zone === selectedZone.id);
    }
    return filtered;
  }, [allOrders, selectedZone]);

  const pedidosSemana = useMemo(() => {
    let filtered = allOrders.filter(order => 
      isThisWeek(order.date) && !isToday(order.date) && !isTomorrow(order.date)
    );
    if (selectedZone) {
      filtered = filtered.filter(order => order.zone === selectedZone.id);
    }
    return filtered;
  }, [allOrders, selectedZone]);

  const stats = [
    {
      title: 'Ventas del Día',
      value: formatCurrency(mockSalesSummary.today.sales),
      icon: 'pi pi-dollar',
      color: '#E31E24',
      change: '+12%'
    },
    {
      title: 'Cobranzas del Día',
      value: formatCurrency(mockSalesSummary.today.collections),
      icon: 'pi pi-money-bill',
      color: '#10B981',
      change: '+8%'
    },
    {
      title: 'Pedidos Hoy',
      value: mockSalesSummary.today.orders,
      icon: 'pi pi-shopping-cart',
      color: '#3B82F6',
      change: '+5'
    },
    {
      title: 'Promedio por Pedido',
      value: formatCurrency(mockSalesSummary.today.avgOrderValue),
      icon: 'pi pi-chart-line',
      color: '#F59E0B',
      change: '+3%'
    }
  ];

  const estadoOptions = [
    { label: 'Verificado', value: 'verificado' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Completado', value: 'completado' },
    { label: 'Entregado', value: 'entregado' }
  ];

  const handleRowClick = (e) => {
    setSelectedTransaction(e.data);
    setTransactionEstado(e.data.estado);
    setShowTransactionModal(true);
  };

  const handleSaveChanges = () => {
    console.log('Guardando cambios:', { transaction: selectedTransaction, newEstado: transactionEstado });
    // Aquí iría la lógica para guardar en el backend
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          {selectedZone ? `Zona: ${selectedZone.name}` : 'Todas las zonas'} |
          Fecha: {new Date().toLocaleDateString('es-AR')}
        </p>
      </div>

      {/* Stats Grid - Larger and more visual */}
      <div className="grid">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 md:col-6 lg:col-3">
            <Card className="stat-card" style={{ border: `2px solid ${stat.color}20`, height: '100%' }}>
              <div className="flex align-items-center justify-content-between mb-3">
                <div style={{
                  backgroundColor: `${stat.color}15`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i
                    className={stat.icon}
                    style={{ color: stat.color, fontSize: '2.5rem' }}
                  ></i>
                </div>
              </div>
              <div className="stat-card-title mb-2">{stat.title}</div>
              <div className="stat-card-value mb-2" style={{ fontSize: '2.5rem' }}>{stat.value}</div>
              <div className="flex align-items-center" style={{ color: stat.color, fontWeight: '600' }}>
                <i className="pi pi-arrow-up mr-2" style={{ fontSize: '0.875rem' }}></i>
                <span>{stat.change} vs ayer</span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Rutas del Día Section */}
      <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
        <div className="col-12">
          <h3 className="text-xl font-bold mb-3">🚚 Rutas del Día</h3>
        </div>
        <div className="col-12 md:col-4">
          <Card 
            onClick={() => navigate('/admin/rutas?filter=hoy')} 
            className="cursor-pointer hover:shadow-lg transition-duration-200"
          >
            <h4 className="text-lg font-bold mb-2">HOY</h4>
            <p className="text-3xl font-bold text-primary mb-1">{pedidosHoy.length}</p>
            <p className="text-sm text-gray-500">entregas programadas</p>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card 
            onClick={() => navigate('/admin/rutas?filter=mañana')} 
            className="cursor-pointer hover:shadow-lg transition-duration-200"
          >
            <h4 className="text-lg font-bold mb-2">MAÑANA</h4>
            <p className="text-3xl font-bold text-primary mb-1">{pedidosManana.length}</p>
            <p className="text-sm text-gray-500">entregas programadas</p>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card 
            onClick={() => navigate('/admin/rutas?filter=semana')} 
            className="cursor-pointer hover:shadow-lg transition-duration-200"
          >
            <h4 className="text-lg font-bold mb-2">LA SEMANA</h4>
            <p className="text-3xl font-bold text-primary mb-1">{pedidosSemana.length}</p>
            <p className="text-sm text-gray-500">entregas programadas</p>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid mt-4">
        <div className="col-12 lg:col-8">
          <Card title="📊 Últimas Transacciones" className="h-full">
            <DataTable
              value={mockRecentTransactions}
              rows={10}
              dataKey="id"
              stripedRows
              className="datatable-responsive"
              onRowClick={handleRowClick}
              rowClassName="clickable-row"
            >
              <Column
                field="fecha"
                header="Fecha/Hora"
                style={{ minWidth: '140px' }}
              />
              <Column
                field="tipo"
                header="Tipo"
                body={(rowData) => (
                  <Tag
                    value={rowData.tipo}
                    severity={
                      rowData.tipo === 'Cobro' ? 'success' :
                      rowData.tipo === 'Venta' ? 'info' :
                      rowData.tipo === 'Factura' ? 'warning' :
                      'secondary'
                    }
                  />
                )}
                style={{ minWidth: '100px' }}
              />
              <Column
                field="cliente"
                header="Cliente"
                style={{ minWidth: '180px' }}
              />
              <Column
                field="monto"
                header="Monto"
                body={(rowData) => (
                  <span className="font-semibold">{formatCurrency(rowData.monto)}</span>
                )}
                style={{ minWidth: '120px' }}
              />
              <Column
                field="estado"
                header="Estado"
                body={(rowData) => (
                  <Tag
                    value={rowData.estado}
                    severity={
                      rowData.estado === 'completado' ? 'success' :
                      rowData.estado === 'pendiente' ? 'warning' :
                      'secondary'
                    }
                  />
                )}
                style={{ minWidth: '120px' }}
              />
            </DataTable>
          </Card>
        </div>

        <div className="col-12 lg:col-4">
          <Card title="Resumen del Mes" className="h-full">
            <div className="mb-3">
              <strong>Ventas:</strong> {formatCurrency(mockSalesSummary.thisMonth.sales)}
            </div>
            <div className="mb-3">
              <strong>Cobranzas:</strong> {formatCurrency(mockSalesSummary.thisMonth.collections)}
            </div>
            <div className="mb-3">
              <strong>Pedidos:</strong> {mockSalesSummary.thisMonth.orders}
            </div>
            <div>
              <strong>Promedio:</strong> {formatCurrency(mockSalesSummary.thisMonth.avgOrderValue)}
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Dialog
        visible={showTransactionModal}
        onHide={() => setShowTransactionModal(false)}
        header="Detalle de Transacción"
        style={{ width: '600px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        {selectedTransaction && (
          <div className="p-fluid">
            <div className="mb-4">
              <h3 className="mb-3">Información Completa</h3>

              <div className="grid">
                <div className="col-6 mb-3">
                  <strong>Tipo:</strong>
                  <div className="mt-1">
                    <Tag
                      value={selectedTransaction.tipo}
                      severity={
                        selectedTransaction.tipo === 'Cobro' ? 'success' :
                        selectedTransaction.tipo === 'Venta' ? 'info' :
                        selectedTransaction.tipo === 'Factura' ? 'warning' :
                        'secondary'
                      }
                    />
                  </div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Fecha/Hora:</strong>
                  <div className="mt-1">{selectedTransaction.fecha}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Cliente:</strong>
                  <div className="mt-1">{selectedTransaction.cliente}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Repartidor:</strong>
                  <div className="mt-1">{selectedTransaction.repartidor}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Monto:</strong>
                  <div className="mt-1 font-bold text-xl">{formatCurrency(selectedTransaction.monto)}</div>
                </div>

                <div className="col-6 mb-3">
                  <strong>Método:</strong>
                  <div className="mt-1">{selectedTransaction.metodo || 'N/A'}</div>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="estado" className="font-bold mb-2 block">
                  Estado
                </label>
                <Dropdown
                  id="estado"
                  value={transactionEstado}
                  options={estadoOptions}
                  onChange={(e) => setTransactionEstado(e.value)}
                  placeholder="Seleccionar estado"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-4">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowTransactionModal(false)}
              />
              <Button
                label="Guardar Cambios"
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

export default Dashboard;
