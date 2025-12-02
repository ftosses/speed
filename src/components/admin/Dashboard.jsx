import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { useZone } from '../../context/ZoneContext';
import { mockSalesSummary, mockRecentTransactions, mockOrders } from '../../services/mockData';
import { formatCurrency } from '../../utils/helpers';
import { isToday, isTomorrow, isThisWeek } from '../../utils/dateHelpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedZone } = useZone();

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

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          {selectedZone ? `Zona: ${selectedZone.name}` : 'Todas las zonas'} |
          Fecha: {new Date().toLocaleDateString('es-AR')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 md:col-6 lg:col-3">
            <div className="stat-card">
              <div className="flex align-items-center justify-content-between">
                <div>
                  <div className="stat-card-title">{stat.title}</div>
                  <div className="stat-card-value">{stat.value}</div>
                  <div className="text-sm" style={{ color: stat.color }}>
                    <i className="pi pi-arrow-up mr-1"></i>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <i
                    className={`${stat.icon} stat-card-icon`}
                    style={{ color: stat.color }}
                  ></i>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default Dashboard;
