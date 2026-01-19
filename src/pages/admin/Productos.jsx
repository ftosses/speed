import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { PRODUCTS, CATEGORIES } from '../../utils/constants';
import { formatCurrency, getStockStatus } from '../../utils/helpers';

const Productos = () => {
  const navigate = useNavigate();
  const [products] = useState(PRODUCTS);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPriceIncreaseModal, setShowPriceIncreaseModal] = useState(false);
  const [priceIncreasePercent, setPriceIncreasePercent] = useState(0);
  const [descontarIVA, setDescontarIVA] = useState(false);

  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    code: '',
    category: '',
    stock: 0,
    unit: '',
    priceA: 0,
    priceB: 0,
    costo: 0
  });

  const handleRowClick = (e) => {
    handleEdit(e.data.id);
  };

  const handleNewProduct = () => {
    setNewProductData({
      name: '',
      code: '',
      category: '',
      stock: 0,
      unit: '',
      priceA: 0,
      priceB: 0,
      costo: 0
    });
    setShowNewProductModal(true);
  };

  const handleSaveNewProduct = () => {
    console.log('Guardando nuevo producto:', newProductData);
    alert('Producto creado exitosamente');
    setShowNewProductModal(false);
  };

  const [editProductData, setEditProductData] = useState(null);
  const [registrarAumento, setRegistrarAumento] = useState(false);
  const [aumentoPorcentaje, setAumentoPorcentaje] = useState(0);

  const handleEdit = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setEditProductData({
        name: product.name,
        code: product.code,
        category: product.category,
        stock: product.stock,
        unit: product.unit,
        priceA: product.prices.lista_a,
        priceB: product.prices.lista_b,
        costo: product.costo,
        estado: product.estado || 'OK'
      });
      setRegistrarAumento(false);
      setAumentoPorcentaje(0);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    console.log('Guardando cambios del producto:', {
      ...editProductData,
      registrarAumento,
      aumentoPorcentaje: registrarAumento ? aumentoPorcentaje : null
    });

    if (registrarAumento && aumentoPorcentaje > 0) {
      alert(`Producto actualizado exitosamente con aumento del ${aumentoPorcentaje}%`);
    } else {
      alert('Producto actualizado exitosamente');
    }

    setShowEditModal(false);
  };

  const handlePriceIncrease = () => {
    if (!selectedProduct) return;

    const newPriceA = selectedProduct.prices.lista_a * (1 + priceIncreasePercent / 100);
    const newPriceB = selectedProduct.prices.lista_b * (1 + priceIncreasePercent / 100);

    console.log('Aplicar aumento del', priceIncreasePercent + '%');
    console.log('Nuevo Precio A:', newPriceA);
    console.log('Nuevo Precio B:', newPriceB);

    setShowPriceIncreaseModal(false);
    setPriceIncreasePercent(0);
  };

  const calculateProfit = (product, withIVA = true) => {
    if (!product) return 0;
    const precioFinal = product.prices.lista_a || 0;
    const costos = (product.costosFijos || 0) + (product.costosVariables || 0);
    const impuesto = product.impuestoGanancias || 0;
    let utilidad = precioFinal - costos - impuesto;

    if (!withIVA) {
      // IVA es 21%
      utilidad = utilidad / 1.21;
    }

    return utilidad;
  };

  const handleDelete = (productId) => {
    console.log('Eliminar producto:', productId);
  };

  // Column templates
  const nameBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.name}</div>
        <div className="text-sm text-gray-600">{rowData.code}</div>
      </div>
    );
  };

  const categoryBodyTemplate = (rowData) => {
    const categoryLabels = {
      [CATEGORIES.BEBIDAS]: 'Bebidas',
      [CATEGORIES.ENERGIZANTES]: 'Energizantes',
      [CATEGORIES.AGUAS]: 'Aguas',
      [CATEGORIES.ALCOHOLES]: 'Alcoholes',
      [CATEGORIES.LICORES]: 'Licores'
    };
    return <span>{categoryLabels[rowData.category]}</span>;
  };

  const stockBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-semibold">{rowData.stock}</span>
        <span className="text-sm text-gray-600">
          {rowData.unidad || rowData.unit + 's'}
        </span>
      </div>
    );
  };

  const costoBodyTemplate = (rowData) => {
    return <span className="text-sm">{formatCurrency(rowData.costo)}</span>;
  };

  const priceABodyTemplate = (rowData) => {
    return formatCurrency(rowData.prices.lista_a);
  };

  const priceBBodyTemplate = (rowData) => {
    return formatCurrency(rowData.prices.lista_b);
  };


  const estadoBodyTemplate = (rowData) => {
    const stockInfo = getStockStatus(rowData.stock, rowData.minStock);

    let icon = '🟢';
    if (stockInfo.status === 'critical') icon = '🔴';
    else if (stockInfo.status === 'low') icon = '🟡';

    return (
      <Tag
        value={`${icon} ${stockInfo.label}`}
        severity={stockInfo.severity}
      />
    );
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
            handleEdit(rowData.id);
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
            handleDelete(rowData.id);
          }}
        />
      </div>
    );
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={[
            { label: 'Todas las categorías', value: null },
            { label: 'Bebidas', value: CATEGORIES.BEBIDAS },
            { label: 'Energizantes', value: CATEGORIES.ENERGIZANTES },
            { label: 'Aguas', value: CATEGORIES.AGUAS },
            { label: 'Alcoholes', value: CATEGORIES.ALCOHOLES },
            { label: 'Licores', value: CATEGORIES.LICORES }
          ]}
          placeholder="Filtrar por categoría"
          showClear={!!selectedCategory}
        />
      </div>
      <Button
        label="Nuevo Producto"
        icon="pi pi-plus"
        onClick={handleNewProduct}
        className="p-button-danger"
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Productos</h1>
        <p className="text-gray-600">
          Catálogo de productos y control de stock
        </p>
      </div>

      <DataTable
        value={filteredProducts}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron productos"
        className="datatable-responsive"
        rowClassName="clickable-row"
        onRowClick={handleRowClick}
        stripedRows
      >
        <Column
          field="name"
          header="Nombre"
          body={nameBodyTemplate}
          sortable
          style={{ minWidth: '200px' }}
        />
        <Column
          field="category"
          header="Categoría"
          body={categoryBodyTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="stock"
          header="Stock"
          body={stockBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="prices.lista_a"
          header="Precio A"
          body={priceABodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="prices.lista_b"
          header="Precio B"
          body={priceBBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="costo"
          header="Costo"
          body={costoBodyTemplate}
          sortable
          style={{ minWidth: '110px' }}
        />
        <Column
          field="stock"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
          style={{ minWidth: '130px' }}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ minWidth: '150px' }}
        />
      </DataTable>

      {/* Edit Product Modal - All Fields Editable */}
      <Dialog
        visible={showEditModal}
        onHide={() => setShowEditModal(false)}
        header={`Editar Producto - ${selectedProduct?.name}`}
        style={{ width: '800px' }}
        breakpoints={{ '960px': '90vw' }}
      >
        {selectedProduct && editProductData && (
          <div className="p-4">
            <div className="grid">
              <div className="col-12 md:col-6 mb-3">
                <label className="block text-sm font-semibold mb-2">Nombre *</label>
                <InputText
                  value={editProductData.name}
                  onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-6 mb-3">
                <label className="block text-sm font-semibold mb-2">Código *</label>
                <InputText
                  value={editProductData.code}
                  onChange={(e) => setEditProductData({ ...editProductData, code: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-6 mb-3">
                <label className="block text-sm font-semibold mb-2">Categoría *</label>
                <Dropdown
                  value={editProductData.category}
                  options={[
                    { label: 'Energizantes', value: CATEGORIES.ENERGIZANTES },
                    { label: 'Bebidas', value: CATEGORIES.BEBIDAS },
                    { label: 'Aguas', value: CATEGORIES.AGUAS },
                    { label: 'Alcoholes', value: CATEGORIES.ALCOHOLES },
                    { label: 'Licores', value: CATEGORIES.LICORES }
                  ]}
                  onChange={(e) => setEditProductData({ ...editProductData, category: e.value })}
                  placeholder="Seleccionar categoría"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-6 mb-3">
                <label className="block text-sm font-semibold mb-2">Stock *</label>
                <InputNumber
                  value={editProductData.stock}
                  onValueChange={(e) => setEditProductData({ ...editProductData, stock: e.value })}
                  min={0}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-6 mb-3">
                <label className="block text-sm font-semibold mb-2">Unidad *</label>
                <Dropdown
                  value={editProductData.unit}
                  options={[
                    { label: 'Botellas', value: 'botellas' },
                    { label: 'Packs de latas', value: 'packs de latas' },
                    { label: 'Unidades', value: 'unidades' },
                    { label: 'Cajas', value: 'cajas' }
                  ]}
                  onChange={(e) => setEditProductData({ ...editProductData, unit: e.value })}
                  placeholder="Seleccionar unidad"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-6 mb-3">
                <label className="block text-sm font-semibold mb-2">Estado *</label>
                <Dropdown
                  value={editProductData.estado}
                  options={[
                    { label: 'OK', value: 'OK' },
                    { label: 'Bajo', value: 'Bajo' },
                    { label: 'Crítico', value: 'Crítico' }
                  ]}
                  onChange={(e) => setEditProductData({ ...editProductData, estado: e.value })}
                  placeholder="Seleccionar estado"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 mb-3">
                <label className="block text-sm font-semibold mb-2">Precio A *</label>
                <InputNumber
                  value={editProductData.priceA}
                  onValueChange={(e) => setEditProductData({ ...editProductData, priceA: e.value })}
                  mode="currency"
                  currency="ARS"
                  locale="es-AR"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 mb-3">
                <label className="block text-sm font-semibold mb-2">Precio B *</label>
                <InputNumber
                  value={editProductData.priceB}
                  onValueChange={(e) => setEditProductData({ ...editProductData, priceB: e.value })}
                  mode="currency"
                  currency="ARS"
                  locale="es-AR"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 mb-3">
                <label className="block text-sm font-semibold mb-2">Costo *</label>
                <InputNumber
                  value={editProductData.costo}
                  onValueChange={(e) => setEditProductData({ ...editProductData, costo: e.value })}
                  mode="currency"
                  currency="ARS"
                  locale="es-AR"
                  className="w-full"
                />
              </div>

              {/* Price Increase Section */}
              <div className="col-12 mt-3 mb-3 p-3" style={{ backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                <div className="flex align-items-center gap-2 mb-3">
                  <Checkbox
                    inputId="registrarAumento"
                    checked={registrarAumento}
                    onChange={(e) => setRegistrarAumento(e.checked)}
                  />
                  <label htmlFor="registrarAumento" className="font-bold cursor-pointer">
                    📈 Registrar Aumento de Precio
                  </label>
                </div>

                {registrarAumento && (
                  <div className="ml-4">
                    <label className="block text-sm font-semibold mb-2">Porcentaje de Aumento (%)</label>
                    <InputNumber
                      value={aumentoPorcentaje}
                      onValueChange={(e) => setAumentoPorcentaje(e.value)}
                      suffix="%"
                      min={0}
                      max={100}
                      className="w-full"
                      style={{ maxWidth: '200px' }}
                    />
                    <small className="block mt-2 text-gray-600">
                      Este porcentaje se aplicará a todos los precios del producto
                    </small>
                  </div>
                )}
              </div>
            </div>

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
                onClick={handleSaveEdit}
                disabled={!editProductData.name || !editProductData.code || !editProductData.category}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Price Increase Modal */}
      <Dialog
        visible={showPriceIncreaseModal}
        onHide={() => setShowPriceIncreaseModal(false)}
        header="📈 Registrar Aumento de Precios"
        style={{ width: '500px' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      >
        <div className="p-fluid">
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Porcentaje de Aumento</label>
            <InputNumber
              value={priceIncreasePercent}
              onValueChange={(e) => setPriceIncreasePercent(e.value)}
              suffix="%"
              min={0}
              max={100}
              className="w-full"
            />
          </div>

          {selectedProduct && priceIncreasePercent > 0 && (
            <div className="mb-4 p-3" style={{ backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
              <h4 className="mb-2">Vista Previa:</h4>
              <div className="grid">
                <div className="col-6">
                  <div className="text-sm text-gray-600">Lista A Actual:</div>
                  <div className="font-semibold">{formatCurrency(selectedProduct.prices.lista_a)}</div>
                </div>
                <div className="col-6">
                  <div className="text-sm text-gray-600">Lista A Nuevo:</div>
                  <div className="font-bold" style={{ color: '#F59E0B' }}>
                    {formatCurrency(selectedProduct.prices.lista_a * (1 + priceIncreasePercent / 100))}
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-sm text-gray-600">Lista B Actual:</div>
                  <div className="font-semibold">{formatCurrency(selectedProduct.prices.lista_b)}</div>
                </div>
                <div className="col-6">
                  <div className="text-sm text-gray-600">Lista B Nuevo:</div>
                  <div className="font-bold" style={{ color: '#F59E0B' }}>
                    {formatCurrency(selectedProduct.prices.lista_b * (1 + priceIncreasePercent / 100))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              outlined
              onClick={() => {
                setShowPriceIncreaseModal(false);
                setPriceIncreasePercent(0);
              }}
            />
            <Button
              label="Aplicar Aumento"
              icon="pi pi-check"
              onClick={handlePriceIncrease}
              disabled={priceIncreasePercent === 0}
            />
          </div>
        </div>
      </Dialog>

      {/* New Product Modal */}
      <Dialog
        visible={showNewProductModal}
        onHide={() => setShowNewProductModal(false)}
        header="Nuevo Producto"
        style={{ width: '700px' }}
        modal
        dismissableMask
      >
        <div className="p-4">
          <div className="grid">
            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Nombre *</label>
              <InputText
                value={newProductData.name}
                onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                className="w-full"
                placeholder="Nombre del producto"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Código *</label>
              <InputText
                value={newProductData.code}
                onChange={(e) => setNewProductData({ ...newProductData, code: e.target.value })}
                className="w-full"
                placeholder="Código SKU"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Categoría *</label>
              <Dropdown
                value={newProductData.category}
                onChange={(e) => setNewProductData({ ...newProductData, category: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  { label: 'Bebidas', value: CATEGORIES.BEBIDAS },
                  { label: 'Energizantes', value: CATEGORIES.ENERGIZANTES },
                  { label: 'Aguas', value: CATEGORIES.AGUAS },
                  { label: 'Alcoholes', value: CATEGORIES.ALCOHOLES },
                  { label: 'Licores', value: CATEGORIES.LICORES }
                ]}
                className="w-full"
                placeholder="Seleccionar categoría"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Unidad *</label>
              <Dropdown
                value={newProductData.unit}
                onChange={(e) => setNewProductData({ ...newProductData, unit: e.value })}
                options={[
                  { label: 'Seleccionar...', value: '' },
                  { label: 'Botellas', value: 'botellas' },
                  { label: 'Packs de latas', value: 'packs de latas' },
                  { label: 'Unidades', value: 'unidades' }
                ]}
                className="w-full"
                placeholder="Seleccionar unidad"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Stock Inicial</label>
              <InputNumber
                value={newProductData.stock}
                onValueChange={(e) => setNewProductData({ ...newProductData, stock: e.value })}
                className="w-full"
                min={0}
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Costo *</label>
              <InputNumber
                value={newProductData.costo}
                onValueChange={(e) => setNewProductData({ ...newProductData, costo: e.value })}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Precio Lista A *</label>
              <InputNumber
                value={newProductData.priceA}
                onValueChange={(e) => setNewProductData({ ...newProductData, priceA: e.value })}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6 mb-3">
              <label className="block text-sm font-semibold mb-2">Precio Lista B *</label>
              <InputNumber
                value={newProductData.priceB}
                onValueChange={(e) => setNewProductData({ ...newProductData, priceB: e.value })}
                mode="currency"
                currency="ARS"
                locale="es-AR"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancelar"
              className="p-button-secondary"
              onClick={() => setShowNewProductModal(false)}
            />
            <Button
              label="Guardar Producto"
              className="p-button-danger"
              onClick={handleSaveNewProduct}
              disabled={!newProductData.name || !newProductData.code || !newProductData.category || !newProductData.unit}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Productos;
