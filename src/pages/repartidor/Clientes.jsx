import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useAuth } from '../../context/AuthContext';
import { mockClients, mockOrders } from '../../services/mockData';
import { ZONES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

const RepartidorClientes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Get repartidor's assigned zone (mock: Juan = Zona Sur, Pedro = San Telmo)
  const myZone = user.id === 1 ? ZONES.SUR.id : ZONES.SAN_TELMO.id;

  // Filter clients by repartidor's zone
  const myClients = mockClients.filter(client => client.zone === myZone);

  // Filter by search term
  const filteredClients = myClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowDetailDialog(true);
  };

  // Get client's recent orders
  const getClientOrders = (clientId) => {
    return mockOrders
      .filter(order => order.clientId === clientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  return (
    <div className="p-3">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">👥 Mis Clientes</h1>
        <p className="text-gray-600">
          {myClients.length} clientes en tu zona
        </p>
      </div>

      <div className="mb-3">
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full"
          />
        </span>
      </div>

      <div className="grid">
        {filteredClients.map((client) => {
          const zone = Object.values(ZONES).find(z => z.id === client.zone);
          const isPositive = client.currentBalance >= 0;

          return (
            <div key={client.id} className="col-12 sm:col-6 md:col-4 mb-3">
              <Card
                className="cursor-pointer hover:shadow-4 transition-duration-200"
                onClick={() => handleClientClick(client)}
              >
                <div className="mb-2">
                  <h3 className="text-xl font-bold mb-1">{client.name}</h3>
                  <Tag
                    value={zone?.name}
                    style={{ backgroundColor: zone?.color }}
                    className="mb-2"
                  />
                </div>

                <p className="text-gray-600 mb-2">
                  <i className="pi pi-map-marker mr-2"></i>
                  {client.address}
                </p>

                <div className="flex justify-content-between align-items-center mt-3 pt-3 border-top-1 border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">Saldo</div>
                    <div className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(Math.abs(client.currentBalance))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Última compra</div>
                    <div className="text-sm font-semibold">
                      {client.lastPurchase ? formatDate(client.lastPurchase) : 'Sin compras'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card className="text-center py-5">
          <i className="pi pi-inbox text-6xl text-gray-400 mb-3"></i>
          <p className="text-xl text-gray-600">No se encontraron clientes</p>
        </Card>
      )}

      {/* Client Detail Dialog */}
      <Dialog
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-user text-2xl"></i>
            <span>Detalle del Cliente</span>
          </div>
        }
        visible={showDetailDialog}
        onHide={() => setShowDetailDialog(false)}
        style={{ width: '700px', maxWidth: '95vw' }}
        modal
        dismissableMask
      >
        {selectedClient && (
          <div>
            <div className="mb-4 pb-3 border-bottom-1 border-gray-200">
              <h2 className="text-2xl font-bold mb-2">{selectedClient.name}</h2>
              <div className="grid">
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Dirección</div>
                  <div className="font-semibold">
                    <i className="pi pi-map-marker mr-2"></i>
                    {selectedClient.address}
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Teléfono</div>
                  <div className="font-semibold">
                    <i className="pi pi-phone mr-2"></i>
                    {selectedClient.phone}
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold">
                    <i className="pi pi-envelope mr-2"></i>
                    {selectedClient.email}
                  </div>
                </div>
                <div className="col-12 md:col-6 mb-2">
                  <div className="text-sm text-gray-600">Saldo Actual</div>
                  <div className={`text-2xl font-bold ${selectedClient.currentBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(Math.abs(selectedClient.currentBalance))}
                    {selectedClient.currentBalance < 0 && ' (DEBE)'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h3 className="text-lg font-bold mb-2">Historial de Pedidos</h3>
              {getClientOrders(selectedClient.id).length > 0 ? (
                <div className="grid">
                  {getClientOrders(selectedClient.id).map(order => (
                    <div key={order.id} className="col-12 mb-2">
                      <Card className="shadow-1">
                        <div className="flex justify-content-between align-items-center">
                          <div>
                            <div className="font-semibold">Pedido #{order.id}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(order.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(order.total)}</div>
                            <Tag
                              value={order.status}
                              severity={order.status === 'entregado' ? 'success' : 'warning'}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay pedidos registrados</p>
              )}
            </div>

            <div className="flex gap-2 justify-content-end">
              <Button
                label="Cerrar"
                icon="pi pi-times"
                className="p-button-secondary"
                onClick={() => setShowDetailDialog(false)}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default RepartidorClientes;
