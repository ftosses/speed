import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

const Reportes = () => {
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date()
  ]);

  const reports = [
    {
      id: 1,
      title: 'Ventas por Período',
      icon: 'pi pi-chart-line',
      color: '#10B981',
      description: 'Análisis de ventas por día, semana y mes con gráficos comparativos',
      path: '/admin/reportes/ventas'
    },
    {
      id: 2,
      title: 'Cobranzas por Método',
      icon: 'pi pi-wallet',
      color: '#3B82F6',
      description: 'Desglose de cobros por método de pago (Efectivo, EFT/TRANS, Tarjeta)',
      path: '/admin/reportes/cobranzas'
    },
    {
      id: 3,
      title: 'Rotación de Productos',
      icon: 'pi pi-refresh',
      color: '#F59E0B',
      description: 'Productos más vendidos y análisis de stock crítico',
      path: '/admin/reportes/productos'
    },
    {
      id: 4,
      title: 'Deudores',
      icon: 'pi pi-exclamation-circle',
      color: '#EF4444',
      description: 'Análisis completo de deuda de clientes con desglose por bajadas y antigüedad',
      path: '/admin/reportes/deudores'
    },
    {
      id: 5,
      title: 'Libro IVA Ventas',
      icon: 'pi pi-book',
      color: '#8B5CF6',
      description: 'Registro de facturas emitidas para declaración de IVA',
      path: '/admin/reportes/iva-ventas'
    }
  ];

  const handleReportClick = (reportPath) => {
    console.log('Navegar a reporte:', reportPath);
  };

  const handleExportExcel = () => {
    console.log('Exportar a Excel');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">📊 Reportes</h1>
        <p className="text-gray-600">
          Análisis y reportes del negocio
        </p>
      </div>

      <Card className="mb-4">
        <div className="flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="flex align-items-center gap-2">
            <label htmlFor="dateRange" className="font-semibold">
              Período:
            </label>
            <Calendar
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.value)}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd/mm/yy"
              placeholder="Seleccionar rango"
              showIcon
            />
          </div>
          <Button
            label="Exportar Todo a Excel"
            icon="pi pi-file-excel"
            className="p-button-success"
            onClick={handleExportExcel}
          />
        </div>
      </Card>

      <div className="grid">
        {reports.map((report) => (
          <div key={report.id} className="col-12 md:col-4 mb-3">
            <Card
              className="h-full cursor-pointer hover:shadow-4 transition-duration-200"
              onClick={() => handleReportClick(report.path)}
            >
              <div className="flex flex-column h-full">
                <div className="flex align-items-center gap-3 mb-3">
                  <div
                    className="flex align-items-center justify-content-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      backgroundColor: `${report.color}20`
                    }}
                  >
                    <i
                      className={`${report.icon} text-4xl`}
                      style={{ color: report.color }}
                    ></i>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold m-0">{report.title}</h2>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 flex-1">
                  {report.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    label="Ver Reporte"
                    icon="pi pi-arrow-right"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReportClick(report.path);
                    }}
                  />
                  <Button
                    icon="pi pi-download"
                    className="p-button-outlined"
                    tooltip="Descargar Excel"
                    tooltipOptions={{ position: 'top' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Descargar Excel:', report.title);
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Card className="mt-4">
        <h3 className="text-xl font-bold mb-3">
          <i className="pi pi-info-circle mr-2"></i>
          Información Adicional
        </h3>
        <div className="grid">
          <div className="col-12 md:col-6">
            <h4 className="font-semibold mb-2">Reportes Disponibles</h4>
            <ul className="list-disc pl-4 text-gray-700">
              <li>Ventas diarias, semanales y mensuales</li>
              <li>Comparativas entre períodos</li>
              <li>Análisis de métodos de pago</li>
              <li>Control de stock y rotación</li>
              <li>Reportes fiscales para AFIP</li>
            </ul>
          </div>
          <div className="col-12 md:col-6">
            <h4 className="font-semibold mb-2">Formatos de Exportación</h4>
            <ul className="list-disc pl-4 text-gray-700">
              <li>Excel (.xlsx) con formato</li>
              <li>PDF para impresión</li>
              <li>CSV para integración</li>
              <li>Gráficos exportables como imagen</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reportes;
