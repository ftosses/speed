import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { PRODUCTS, CATEGORIES, PRICE_LISTS } from '../../utils/constants';
import { formatCurrency, getStockStatus } from '../../utils/helpers';

const RepartidorStock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const categories = [
    { label: 'Todas las categorías', value: null },
    { label: 'Energizantes', value: CATEGORIES.ENERGIZANTES },
    { label: 'Bebidas', value: CATEGORIES.BEBIDAS },
    { label: 'Aguas', value: CATEGORIES.AGUAS },
    { label: 'Alcoholes', value: CATEGORIES.ALCOHOLES },
    { label: 'Licores', value: CATEGORIES.LICORES }
  ];

  // Filter products
  let filteredProducts = PRODUCTS;

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-3">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">📦 Stock Disponible</h1>
        <p className="text-gray-600">
          {PRODUCTS.length} productos en catálogo
        </p>
      </div>

      <div className="grid mb-3">
        <div className="col-12 md:col-8">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full"
            />
          </span>
        </div>
        <div className="col-12 md:col-4">
          <Dropdown
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.value)}
            options={categories}
            placeholder="Filtrar por categoría"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map((producto) => {
          const stockStatus = producto.stock > 100 ? 'success' : producto.stock > 20 ? 'warning' : 'danger';
          const stockLabel = producto.stock > 100 ? 'OK' : producto.stock > 20 ? 'Bajo' : 'Crítico';

          return (
            <Card key={producto.id} className="hover:shadow-lg transition-duration-200">
              <h3 className="text-xl font-bold mb-2">{producto.name}</h3>
              <p className="text-gray-600 mb-2">
                Stock: {producto.stock} {producto.unit}s
              </p>
              <Tag
                severity={stockStatus}
                value={stockLabel}
                className="mb-2"
              />
              <p className="mt-2 text-lg font-semibold">
                Precio: {formatCurrency(producto.prices[PRICE_LISTS.LISTA_A])}
              </p>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="text-center py-5">
          <i className="pi pi-inbox text-6xl text-gray-400 mb-3"></i>
          <p className="text-xl text-gray-600">No se encontraron productos</p>
        </Card>
      )}

      {/* Product Detail Dialog */}
      <Dialog
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-box text-2xl"></i>
            <span>Detalle del Producto</span>
          </div>
        }
        visible={showDetailDialog}
        onHide={() => setShowDetailDialog(false)}
        style={{ width: '600px', maxWidth: '95vw' }}
        modal
        dismissableMask
      >
        {selectedProduct && (
          <div>
            <div className="text-center mb-4">
              <div className="flex align-items-center justify-content-center bg-gray-100"
                   style={{ width: '120px', height: '120px', borderRadius: '12px', margin: '0 auto' }}>
                <i className="pi pi-box text-6xl text-gray-400"></i>
              </div>
            </div>

            <div className="mb-4 pb-3 border-bottom-1 border-gray-200">
              <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
              <p className="text-gray-600 mb-2">{selectedProduct.description}</p>
              <div className="grid">
                <div className="col-6">
                  <div className="text-sm text-gray-600">Código</div>
                  <div className="font-semibold">{selectedProduct.code}</div>
                </div>
                <div className="col-6">
                  <div className="text-sm text-gray-600">Unidad</div>
                  <div className="font-semibold">{selectedProduct.unit}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Stock</h3>
              <div className="grid">
                <div className="col-6">
                  <div className="text-sm text-gray-600">Disponible</div>
                  <div className="text-2xl font-bold">{selectedProduct.stock} {selectedProduct.unit}s</div>
                </div>
                <div className="col-6">
                  <div className="text-sm text-gray-600">Estado</div>
                  <Tag
                    value={getStockStatus(selectedProduct.stock, selectedProduct.minStock).label}
                    severity={getStockStatus(selectedProduct.stock, selectedProduct.minStock).severity}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Listas de Precios</h3>
              <div className="grid">
                <div className="col-12 md:col-4 mb-2">
                  <Card className="bg-blue-50">
                    <div className="text-sm text-gray-600">Lista A (Estándar)</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedProduct.prices.lista_a)}</div>
                  </Card>
                </div>
                <div className="col-12 md:col-4 mb-2">
                  <Card className="bg-green-50">
                    <div className="text-sm text-gray-600">Lista B (-10%)</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedProduct.prices.lista_b)}</div>
                  </Card>
                </div>
                <div className="col-12 md:col-4 mb-2">
                  <Card className="bg-orange-50">
                    <div className="text-sm text-gray-600">Lista C (-15%)</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedProduct.prices.lista_c)}</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default RepartidorStock;
