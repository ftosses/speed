import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { mockOrders, mockRepartidores, mockClients } from '../../services/mockData';
import { ZONES, ORDER_STATUS, ORDER_STATUS_LABELS, PRODUCTS, PRICE_LISTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useZone } from '../../context/ZoneContext';

const Pedidos = () => {
  const { selectedZone } = useZone();
  const [orders, setOrders] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit form state
  const [editDate, setEditDate] = useState(null);
  const [editRepartidorId, setEditRepartidorId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [editNotes, setEditNotes] = useState('');
  const [editDiscountPercent, setEditDiscountPercent] = useState(0);

  // New order modal state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderClienteId, setNewOrderClienteId] = useState(null);
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderDate, setNewOrderDate] = useState(new Date());
  const [newOrderRepartidorId, setNewOrderRepartidorId] = useState(null);

  useEffect(() => {
    let filteredOrders = mockOrders;

    if (selectedZone) {
      filteredOrders = filteredOrders.filter(o => o.zone === selectedZone.id);
    }

    if (selectedStatus) {
      filteredOrders = filteredOrders.filter(o => o.status === selectedStatus);
    }

    setOrders(filteredOrders);
  }, [selectedZone, selectedStatus]);

  const handleRowClick = (e) => {
    openEditModal(e.data);
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditDate(new Date(order.createdAt));
    setEditRepartidorId(order.repartidorId);
    setEditStatus(order.status);
    setEditItems([...order.items]);
    setEditNotes(order.notes || '');
    setEditDiscountPercent(order.discountPercent || 0);
    setShowEditModal(true);
  };

  const handleNewOrder = () => {
    setNewOrderClienteId(null);
    setNewOrderItems([]);
    setNewOrderNotes('');
    setNewOrderDate(new Date());
    setNewOrderRepartidorId(null);
    setShowNewOrderModal(true);
  };

  const handleAddNewOrderProduct = () => {
    const newItem = {
      productId: null,
      productName: '',
      quantity: 1,
      pricePerUnit: 0,
      priceList: PRICE_LISTS.LISTA_B,
      subtotal: 0
    };
    setNewOrderItems([...newOrderItems, newItem]);
  };

  const handleRemoveNewOrderProduct = (index) => {
    const newItems = newOrderItems.filter((_, i) => i !== index);
    setNewOrderItems(newItems);
  };

  const handleNewOrderProductChange = (index, field, value) => {
    const newItems = [...newOrderItems];
    newItems[index][field] = value;

    if (field === 'productId' && value) {
      const product = PRODUCTS.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].pricePerUnit = product.prices[newItems[index].priceList] || 0;
      }
    }

    // If price list changes, update the price per unit
    if (field === 'priceList' && newItems[index].productId) {
      const product = PRODUCTS.find(p => p.id === newItems[index].productId);
      if (product) {
        newItems[index].pricePerUnit = product.prices[value] || 0;
      }
    }

    newItems[index].subtotal = newItems[index].quantity * newItems[index].pricePerUnit;
    setNewOrderItems(newItems);
  };

  const calculateNewOrderTotal = () => {
    return newOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSaveNewOrder = () => {
    if (!newOrderClienteId) {
      alert('Debe seleccionar un cliente');
      return;
    }
    if (newOrderItems.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }
    if (!newOrderRepartidorId) {
      alert('Debe seleccionar un repartidor');
      return;
    }

    console.log('Guardando nuevo pedido:', {
      clienteId: newOrderClienteId,
      items: newOrderItems,
      notes: newOrderNotes,
      date: newOrderDate,
      repartidorId: newOrderRepartidorId,
      total: calculateNewOrderTotal()
    });

    alert('Pedido creado exitosamente');
    setShowNewOrderModal(false);
  };

  const handleDeleteOrder = (order) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar el pedido #${order.id}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => {
        console.log('Eliminando pedido:', order.id);
        alert(`Pedido #${order.id} eliminado`);
      }
    });
  };

  const handleSaveOrder = () => {
    const updatedOrder = {
      ...selectedOrder,
      createdAt: editDate.toISOString(),
      repartidorId: editRepartidorId,
      repartidorName: mockRepartidores.find(r => r.id === editRepartidorId)?.name,
      status: editStatus,
      items: editItems,
      notes: editNotes,
      discountPercent: editDiscountPercent,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal()
    };

    console.log('Guardando pedido:', updatedOrder);
    alert('Pedido actualizado exitosamente');
    setShowEditModal(false);
  };

  // Product editing functions
  const handleAddProduct = () => {
    const newItem = {
      productId: null,
      productName: '',
      quantity: 1,
      pricePerUnit: 0,
      priceList: selectedOrder.items[0]?.priceList || PRICE_LISTS.LISTA_B,
      subtotal: 0
    };
    setEditItems([...editItems, newItem]);
  };

  const handleRemoveProduct = (index) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
  };

  const handleProductChange = (index, field, value) => {
    const newItems = [...editItems];
    newItems[index][field] = value;

    // If product is selected, update related fields
    if (field === 'productId' && value) {
      const product = PRODUCTS.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].pricePerUnit = product.prices[newItems[index].priceList] || 0;
      }
    }

    // Recalculate subtotal
    newItems[index].subtotal = newItems[index].quantity * newItems[index].pricePerUnit;

    setEditItems(newItems);
  };

  // Calculation functions
  const calculateSubtotal = () => {
    return editItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * editDiscountPercent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  // Column templates
  const idBodyTemplate = (rowData) => {
    return <span className="font-mono font-semibold">#{rowData.id}</span>;
  };

  const fechaBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{formatDate(rowData.date)}</div>
        <div className="text-sm text-gray-600">
          {new Date(rowData.date).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  };

  const clienteBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.clientName}</div>
        <div className="text-sm text-gray-600">{rowData.clientAddress}</div>
      </div>
    );
  };

  const repartidorBodyTemplate = (rowData) => {
    return rowData.repartidorName || '-';
  };

  const zoneBodyTemplate = (rowData) => {
    const zone = Object.values(ZONES).find(z => z.id === rowData.zone);
    return (
      <Tag
        value={zone?.name}
        style={{ backgroundColor: zone?.color }}
      />
    );
  };

  const totalBodyTemplate = (rowData) => {
    return <span className="font-semibold">{formatCurrency(rowData.total)}</span>;
  };

  const estadoBodyTemplate = (rowData) => {
    const statusConfig = {
      [ORDER_STATUS.PENDIENTE]: { severity: 'secondary', icon: '⏳' },
      [ORDER_STATUS.EN_RUTA]: { severity: 'info', icon: '🚚' },
      [ORDER_STATUS.ENTREGADO]: { severity: 'success', icon: '✅' },
      [ORDER_STATUS.DEVOLUCION_PARCIAL]: { severity: 'warning', icon: '⚠️' },
      [ORDER_STATUS.CANCELADO]: { severity: 'danger', icon: '❌' },
      [ORDER_STATUS.CONSIGNACION]: { severity: 'info', icon: '📦' }
    };

    const config = statusConfig[rowData.status] || { severity: 'secondary', icon: '' };

    return (
      <Tag
        value={`${config.icon} ${ORDER_STATUS_LABELS[rowData.status]}`}
        severity={config.severity}
      />
    );
  };

  const handleDownloadRemito = (order) => {
    console.log('Descargando remito para pedido:', order.id);
    // TODO: Implement PDF remito generation
    alert(`Generando remito para pedido #${order.orderNumber}`);
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #F9F9F9',
            color: '#E31E24',
            borderRadius: '8px',
            minHeight: '40px',
            minWidth: '40px'
          }}
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(rowData);
          }}
        />
        <Button
          icon="pi pi-download"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #F9F9F9',
            color: '#E31E24',
            borderRadius: '8px',
            minHeight: '40px',
            minWidth: '40px'
          }}
          tooltip="Descargar Remito"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadRemito(rowData);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text"
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #F9F9F9',
            color: '#E31E24',
            borderRadius: '8px',
            minHeight: '40px',
            minWidth: '40px'
          }}
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteOrder(rowData);
          }}
        />
      </div>
    );
  };

  // Repartidor options for dropdown
  const repartidorOptions = mockRepartidores.map(r => ({
    label: r.name,
    value: r.id
  }));

  // Product options for dropdown
  const productOptions = PRODUCTS.map(p => ({
    label: `${p.name} - ${formatCurrency(p.prices[PRICE_LISTS.LISTA_B])}`,
    value: p.id
  }));

  // Status options
  const statusOptions = Object.keys(ORDER_STATUS).map(key => ({
    label: ORDER_STATUS_LABELS[ORDER_STATUS[key]],
    value: ORDER_STATUS[key]
  }));

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar pedido..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.value)}
          options={[
            { label: 'Todos los estados', value: null },
            ...Object.keys(ORDER_STATUS).map(key => ({
              label: ORDER_STATUS_LABELS[ORDER_STATUS[key]],
              value: ORDER_STATUS[key]
            }))
          ]}
          placeholder="Filtrar por estado"
          showClear={!!selectedStatus}
        />
      </div>
      <Button
        label="Cargar Pedido"
        icon="pi pi-box"
        onClick={handleNewOrder}
        className="p-button-danger"
      />
    </div>
  );

  return (
    <div className="p-4">
      <ConfirmDialog />

      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">📦 Pedidos</h1>
        <p className="text-gray-600">
          Gestión de pedidos y entregas
        </p>
      </div>

      <DataTable
        value={orders}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron pedidos"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="id"
          header="ID"
          body={idBodyTemplate}
          sortable
          style={{ minWidth: '80px' }}
        />
        <Column
          field="date"
          header="Fecha"
          body={fechaBodyTemplate}
          sortable
          style={{ minWidth: '140px' }}
        />
        <Column
          field="clientName"
          header="Cliente"
          body={clienteBodyTemplate}
          sortable
          style={{ minWidth: '220px' }}
        />
        <Column
          field="repartidorName"
          header="Repartidor"
          body={repartidorBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="zone"
          header="Zona"
          body={zoneBodyTemplate}
          sortable
          style={{ minWidth: '130px' }}
        />
        <Column
          field="total"
          header="Total"
          body={totalBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="status"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '150px' }}
        />
      </DataTable>

      {/* Edit Order Modal */}
      <Dialog
        visible={showEditModal}
        onHide={() => setShowEditModal(false)}
        header="Editar Pedido"
        style={{ width: '90vw', maxWidth: '1200px' }}
        breakpoints={{ '960px': '95vw' }}
        maximizable
      >
        {selectedOrder && (
          <div className="p-fluid">
            {/* Order Header Info */}
            <div className="grid mb-4">
              <div className="col-12">
                <h3 className="mb-3">📋 Información del Pedido</h3>
              </div>

              <div className="col-12 md:col-4 mb-3">
                <strong>N° Pedido:</strong>
                <div className="text-xl font-mono font-bold mt-1">
                  {selectedOrder.orderNumber}
                </div>
              </div>

              <div className="col-12 md:col-4 mb-3">
                <strong>Cliente:</strong>
                <div className="text-lg mt-1">{selectedOrder.clientName}</div>
                <div className="text-sm text-gray-600">{selectedOrder.clientAddress}</div>
              </div>

              <div className="col-12 md:col-4 mb-3">
                <strong>Zona:</strong>
                <div className="mt-1">
                  {zoneBodyTemplate(selectedOrder)}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid mb-4">
              <div className="col-12">
                <h3 className="mb-3">✏️ Datos Editables</h3>
              </div>

              <div className="col-12 md:col-4 mb-3">
                <label htmlFor="editDate" className="font-bold mb-2 block">
                  Fecha del Pedido *
                </label>
                <Calendar
                  id="editDate"
                  value={editDate}
                  onChange={(e) => setEditDate(e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  showTime
                  hourFormat="24"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 mb-3">
                <label htmlFor="editRepartidor" className="font-bold mb-2 block">
                  Repartidor *
                </label>
                <Dropdown
                  id="editRepartidor"
                  value={editRepartidorId}
                  options={repartidorOptions}
                  onChange={(e) => setEditRepartidorId(e.value)}
                  placeholder="Seleccionar repartidor"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 mb-3">
                <label htmlFor="editStatus" className="font-bold mb-2 block">
                  Estado *
                </label>
                <Dropdown
                  id="editStatus"
                  value={editStatus}
                  options={statusOptions}
                  onChange={(e) => setEditStatus(e.value)}
                  placeholder="Seleccionar estado"
                  className="w-full"
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-4">
              <div className="flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">📦 Productos</h3>
                <Button
                  icon="pi pi-plus"
                  className="p-button-sm p-button-success p-button-rounded"
                  onClick={handleAddProduct}
                  tooltip="Agregar Producto"
                  tooltipOptions={{ position: 'left' }}
                />
              </div>

              {editItems.map((item, index) => (
                <div key={index} className="grid mb-3 p-3 border-1 border-gray-300 border-round">
                  <div className="col-12 md:col-4 mb-2">
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
                    <label className="font-bold mb-2 block">Precio Unitario</label>
                    <InputNumber
                      value={item.pricePerUnit}
                      onValueChange={(e) => handleProductChange(index, 'pricePerUnit', e.value)}
                      mode="currency"
                      currency="ARS"
                      locale="es-AR"
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-2 mb-2">
                    <label className="font-bold mb-2 block">Subtotal</label>
                    <div className="flex align-items-center gap-2">
                      <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                      <Button
                        icon="pi pi-trash"
                        className="p-button-danger p-button-sm p-button-text"
                        onClick={() => handleRemoveProduct(index)}
                        tooltip="Eliminar"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="grid mb-4">
              <div className="col-12">
                <h3 className="mb-3">💰 Totales</h3>
              </div>

              <div className="col-12 md:col-3 mb-3">
                <label className="font-bold mb-2 block">Descuento (%)</label>
                <InputNumber
                  value={editDiscountPercent}
                  onValueChange={(e) => setEditDiscountPercent(e.value)}
                  min={0}
                  max={100}
                  suffix="%"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-9 mb-3">
                <div className="grid">
                  <div className="col-4">
                    <strong>Subtotal:</strong>
                    <div className="text-xl mt-1">{formatCurrency(calculateSubtotal())}</div>
                  </div>
                  <div className="col-4">
                    <strong>Descuento:</strong>
                    <div className="text-xl mt-1 text-orange-500">
                      -{formatCurrency(calculateDiscount())}
                    </div>
                  </div>
                  <div className="col-4">
                    <strong>Total:</strong>
                    <div className="text-2xl font-bold mt-1" style={{ color: '#E31E24' }}>
                      {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-4">
              <label htmlFor="editNotes" className="font-bold mb-2 block">
                📝 Notas / Observaciones
              </label>
              <InputTextarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="Agregar notas sobre el pedido..."
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-content-end gap-2 mt-4">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setShowEditModal(false)}
              />
              <Button
                label="Guardar Cambios"
                icon="pi pi-check"
                className="p-button-danger"
                onClick={handleSaveOrder}
                disabled={!editDate || !editRepartidorId || !editStatus || editItems.length === 0}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* New Order Modal */}
      <Dialog
        visible={showNewOrderModal}
        onHide={() => setShowNewOrderModal(false)}
        header="Cargar Nuevo Pedido"
        style={{ width: '90vw', maxWidth: '1200px' }}
        breakpoints={{ '960px': '95vw' }}
        maximizable
      >
        <div className="p-fluid">
          {/* Client, Date, and Repartidor Selection */}
          <div className="grid mb-4">
            <div className="col-12">
              <h3 className="mb-3">📋 Información del Pedido</h3>
            </div>

            <div className="col-12 md:col-4 mb-3">
              <label htmlFor="newOrderCliente" className="font-bold mb-2 block">
                Cliente *
              </label>
              <Dropdown
                id="newOrderCliente"
                value={newOrderClienteId}
                options={mockClients.map(c => ({
                  label: `${c.name} - ${c.address}`,
                  value: c.id
                }))}
                onChange={(e) => setNewOrderClienteId(e.value)}
                placeholder="Seleccionar cliente"
                filter
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-4 mb-3">
              <label htmlFor="newOrderDate" className="font-bold mb-2 block">
                Fecha del Pedido *
              </label>
              <Calendar
                id="newOrderDate"
                value={newOrderDate}
                onChange={(e) => setNewOrderDate(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-4 mb-3">
              <label htmlFor="newOrderRepartidor" className="font-bold mb-2 block">
                Repartidor *
              </label>
              <Dropdown
                id="newOrderRepartidor"
                value={newOrderRepartidorId}
                options={repartidorOptions}
                onChange={(e) => setNewOrderRepartidorId(e.value)}
                placeholder="Seleccionar repartidor"
                className="w-full"
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-4">
            <div className="flex justify-content-between align-items-center mb-3">
              <h3 className="m-0">📦 Productos</h3>
              <Button
                icon="pi pi-plus"
                className="p-button-sm p-button-success p-button-rounded"
                onClick={handleAddNewOrderProduct}
                tooltip="Agregar Producto"
                tooltipOptions={{ position: 'left' }}
              />
            </div>

            {newOrderItems.length === 0 ? (
              <div className="text-center p-4 border-1 border-gray-300 border-round">
                <p className="text-gray-500">No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.</p>
              </div>
            ) : (
              newOrderItems.map((item, index) => (
                <div key={index} className="grid mb-3 p-3 border-1 border-gray-300 border-round">
                  <div className="col-12 md:col-4 mb-2">
                    <label className="font-bold mb-2 block">Producto</label>
                    <Dropdown
                      value={item.productId}
                      options={productOptions}
                      onChange={(e) => handleNewOrderProductChange(index, 'productId', e.value)}
                      placeholder="Seleccionar producto"
                      filter
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-2 mb-2">
                    <label className="font-bold mb-2 block">Lista de Precio</label>
                    <Dropdown
                      value={item.priceList}
                      options={[
                        { label: 'Lista A', value: PRICE_LISTS.LISTA_A },
                        { label: 'Lista B', value: PRICE_LISTS.LISTA_B }
                      ]}
                      onChange={(e) => handleNewOrderProductChange(index, 'priceList', e.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-2 mb-2">
                    <label className="font-bold mb-2 block">Cantidad</label>
                    <InputNumber
                      value={item.quantity}
                      onValueChange={(e) => handleNewOrderProductChange(index, 'quantity', e.value)}
                      min={1}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-2 mb-2">
                    <label className="font-bold mb-2 block">Precio Unit.</label>
                    <InputNumber
                      value={item.pricePerUnit}
                      onValueChange={(e) => handleNewOrderProductChange(index, 'pricePerUnit', e.value)}
                      mode="currency"
                      currency="ARS"
                      locale="es-AR"
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-2 mb-2">
                    <label className="font-bold mb-2 block">Subtotal</label>
                    <div className="flex align-items-center gap-2">
                      <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                      <Button
                        icon="pi pi-trash"
                        className="p-button-danger p-button-sm p-button-text"
                        onClick={() => handleRemoveNewOrderProduct(index)}
                        tooltip="Eliminar"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="grid mb-4">
            <div className="col-12">
              <h3 className="mb-3">💰 Total</h3>
            </div>
            <div className="col-12">
              <div className="text-right">
                <strong>Total del Pedido:</strong>
                <div className="text-3xl font-bold mt-1" style={{ color: '#E31E24' }}>
                  {formatCurrency(calculateNewOrderTotal())}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-4">
            <label htmlFor="newOrderNotes" className="font-bold mb-2 block">
              📝 Notas / Observaciones
            </label>
            <InputTextarea
              id="newOrderNotes"
              value={newOrderNotes}
              onChange={(e) => setNewOrderNotes(e.target.value)}
              rows={3}
              placeholder="Agregar notas sobre el pedido..."
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowNewOrderModal(false)}
            />
            <Button
              label="Crear Pedido"
              icon="pi pi-check"
              className="p-button-danger"
              onClick={handleSaveNewOrder}
              disabled={!newOrderClienteId || !newOrderRepartidorId || newOrderItems.length === 0}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Pedidos;
