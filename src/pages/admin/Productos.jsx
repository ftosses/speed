import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { PRODUCTS, CATEGORIES } from '../../utils/constants';
import { formatCurrency, getStockStatus } from '../../utils/helpers';

const Productos = () => {
  const navigate = useNavigate();
  const [products] = useState(PRODUCTS);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleRowClick = (e) => {
    navigate(`/admin/productos/${e.data.id}`);
  };

  const handleNewProduct = () => {
    console.log('Nuevo producto');
  };

  const handleView = (productId) => {
    navigate(`/admin/productos/${productId}`);
  };

  const handleEdit = (productId) => {
    console.log('Editar producto:', productId);
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
          {rowData.unit}s
        </span>
      </div>
    );
  };

  const priceABodyTemplate = (rowData) => {
    return formatCurrency(rowData.prices.lista_a);
  };

  const priceBBodyTemplate = (rowData) => {
    return formatCurrency(rowData.prices.lista_b);
  };

  const priceCBodyTemplate = (rowData) => {
    return formatCurrency(rowData.prices.lista_c);
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
          icon="pi pi-eye"
          className="action-button"
          tooltip="Ver"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleView(rowData.id);
          }}
        />
        <Button
          icon="pi pi-pencil"
          className="action-button"
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(rowData.id);
          }}
        />
        <Button
          icon="pi pi-trash"
          className="action-button"
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
          field="prices.lista_c"
          header="Precio C"
          body={priceCBodyTemplate}
          sortable
          style={{ minWidth: '120px' }}
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
    </div>
  );
};

export default Productos;
