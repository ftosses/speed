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
import { mockSalesSummary, mockRecentTransactions, mockOrders, mockClients } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';
import { isToday, isTomorrow, isThisWeek } from '../../utils/dateHelpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionEstado, setTransactionEstado] = useState('');
  const [timeFilter, setTimeFilter] = useState('HOY');

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

  // Calculate debtors today
  const deudoresHoy = useMemo(() => {
    let deudores = mockClients.filter(client => client.deudaTotal > 0);
    if (selectedZone) {
      deudores = deudores.filter(client => client.zone === selectedZone.id);
    }
    return deudores;
  }, [selectedZone]);

  // Get data based on time filter
  const getFilteredData = () => {
    switch (timeFilter) {
      case 'HOY':
        return mockSalesSummary.today;
      case '7 DÍAS':
        return mockSalesSummary.thisWeek || mockSalesSummary.today;
      case 'MES':
        return mockSalesSummary.thisMonth;
      case 'TOTAL':
        return {
          sales: mockSalesSummary.thisMonth.sales * 3, // Mock total
          collections: mockSalesSummary.thisMonth.collections * 3,
          orders: mockSalesSummary.thisMonth.orders * 3
        };
      default:
        return mockSalesSummary.today;
    }
  };

  const filteredData = getFilteredData();

  const stats = [
    {
      title: `Ventas ${timeFilter === 'HOY' ? 'del Día' : timeFilter === '7 DÍAS' ? 'de la Semana' : timeFilter === 'MES' ? 'del Mes' : 'Totales'}`,
      value: formatCurrency(filteredData.sales),
      icon: 'pi pi-dollar',
      navigateTo: '/admin/reportes?tab=ventas'
    },
    {
      title: `Cobranzas ${timeFilter === 'HOY' ? 'del Día' : timeFilter === '7 DÍAS' ? 'de la Semana' : timeFilter === 'MES' ? 'del Mes' : 'Totales'}`,
      value: formatCurrency(filteredData.collections),
      icon: 'pi pi-money-bill',
      navigateTo: '/admin/cobros'
    },
    {
      title: `Pedidos ${timeFilter === 'HOY' ? 'Hoy' : timeFilter === '7 DÍAS' ? 'de la Semana' : timeFilter === 'MES' ? 'del Mes' : 'Totales'}`,
      value: filteredData.orders,
      icon: 'pi pi-shopping-cart',
      navigateTo: '/admin/pedidos'
    },
    {
      title: 'Deudores al Día',
      value: deudoresHoy.length,
      icon: 'pi pi-exclamation-circle',
      navigateTo: '/admin/deudores'
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
        <div className="flex justify-content-between align-items-center mb-3">
          <h1 className="m-0">Dashboard</h1>
          <div className="flex gap-2">
            {['HOY', '7 DÍAS', 'MES', 'TOTAL'].map((filter) => (
              <Button
                key={filter}
                label={filter}
                className={timeFilter === filter ? 'p-button-danger' : 'p-button-outlined'}
                style={{
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem'
                }}
                onClick={() => setTimeFilter(filter)}
              />
            ))}
          </div>
        </div>
        <p>
          {selectedZone ? `Zona: ${selectedZone.name}` : 'Todas las zonas'} |
          Fecha: {new Date().toLocaleDateString('es-AR')}
        </p>
      </div>

      {/* Stats Grid - Compact with monochromatic gray icons */}
      <div className="grid">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 md:col-6 lg:col-3">
            <Card
              className="stat-card"
              style={{
                border: '1px solid #E5E7EB',
                height: '100%',
                cursor: 'pointer',
                padding: '0.75rem'
              }}
              onClick={() => navigate(stat.navigateTo)}
            >
              <div className="flex align-items-center gap-3">
                <div style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i
                    className={stat.icon}
                    style={{ color: '#6B7280', fontSize: '1.5rem' }}
                  ></i>
                </div>
                <div className="flex-1">
                  <div className="stat-card-title mb-1" style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{stat.title}</div>
                  <div className="stat-card-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stat.value}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Rutas del Día Section */}
      <div className="mt-4 mb-4">
        <h3 className="text-xl font-bold mb-3">🚚 Rutas del Día</h3>
        <div className="grid">
          <div className="col-12 md:col-4">
            <Card
              onClick={() => navigate('/admin/rutas?filter=hoy')}
              className="cursor-pointer hover:shadow-lg transition-duration-200"
              style={{ padding: '1rem' }}
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
              style={{ padding: '1rem' }}
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
              style={{ padding: '1rem' }}
            >
              <h4 className="text-lg font-bold mb-2">LA SEMANA</h4>
              <p className="text-3xl font-bold text-primary mb-1">{pedidosSemana.length}</p>
              <p className="text-sm text-gray-500">entregas programadas</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid mt-4">
        <div className="col-12">
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
                sortable
                style={{ minWidth: '140px' }}
              />
              <Column
                field="tipo"
                header="Tipo"
                body={(rowData) => (
                  <Tag
                    value={rowData.tipo}
                    style={{
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: 'none'
                    }}
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
                body={(rowData) => {
                  let tagStyle = {
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: 'none'
                  };

                  // Apply color based on status
                  if (rowData.estado?.toLowerCase() === 'pendiente') {
                    tagStyle = {
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none'
                    };
                  } else if (rowData.estado?.toLowerCase() === 'entregado') {
                    tagStyle = {
                      backgroundColor: '#D1FAE5',
                      color: '#059669',
                      border: 'none'
                    };
                  }

                  return <Tag value={rowData.estado} style={tagStyle} />;
                }}
                style={{ minWidth: '120px' }}
              />
            </DataTable>
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
