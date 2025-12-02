import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { formatCurrency } from '../../utils/helpers';

const PaymentModal = ({ visible, onHide, order, onConfirm }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState(order?.total || 0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const toastRef = useRef(null);

  if (!order) return null;

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (method !== 'no_pago') {
      setAmount(order.total);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.files[0];
    if (file) {
      setUploadedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      if (toastRef.current) {
        toastRef.current.show({
          severity: 'success',
          summary: 'Archivo cargado',
          detail: 'Comprobante adjuntado correctamente',
          life: 2000
        });
      }
    }
  };

  const handleConfirm = () => {
    if (selectedMethod === 'efectivo') {
      if (!amount || amount <= 0) {
        if (toastRef.current) {
          toastRef.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Ingrese el monto recibido',
            life: 3000
          });
        }
        return;
      }

      // Show confirmation and generate invoice/remito
      if (toastRef.current) {
        toastRef.current.show({
          severity: 'info',
          summary: 'Procesando pago',
          detail: 'Registrando pago en efectivo...',
          life: 1500
        });
      }

      setTimeout(() => {
        if (order.client?.hasCompleteData) {
          // Generate Factura
          if (toastRef.current) {
            toastRef.current.show({
              severity: 'info',
              summary: 'Generando factura...',
              detail: 'Conectando con AFIP...',
              life: 1500
            });
          }

          setTimeout(() => {
            window.open('/mock-factura.pdf', '_blank');
            if (toastRef.current) {
              toastRef.current.show({
                severity: 'success',
                summary: 'Factura emitida ✅',
                detail: 'Factura generada correctamente',
                life: 3000
              });
            }
            onConfirm({ method: 'efectivo', amount });
            onHide();
          }, 1500);
        } else {
          // Generate Remito
          const missingFields = [];
          if (!order.client.razonSocial) missingFields.push('Razón Social');
          if (!order.client.cuit) missingFields.push('CUIT');
          if (!order.client.ivaCondition) missingFields.push('Condición IVA');

          if (toastRef.current) {
            toastRef.current.show({
              severity: 'warning',
              summary: '⚠️ Datos incompletos. Generando remito...',
              detail: `Faltan: ${missingFields.join(', ')}. Admin facturará después.`,
              life: 4000
            });
          }

          setTimeout(() => {
            window.open('/mock-remito.pdf', '_blank');
            if (toastRef.current) {
              toastRef.current.show({
                severity: 'success',
                summary: 'Remito generado',
                detail: 'Remito generado. Admin facturará después.',
                life: 3000
              });
            }
            onConfirm({ method: 'efectivo', amount });
            onHide();
          }, 1500);
        }
      }, 500);

    } else if (selectedMethod === 'eft_trans') {
      if (!amount || amount <= 0) {
        if (toastRef.current) {
          toastRef.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Ingrese el monto',
            life: 3000
          });
        }
        return;
      }

      if (!uploadedFile) {
        if (toastRef.current) {
          toastRef.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Adjunte el comprobante',
            life: 3000
          });
        }
        return;
      }

      // Show confirmation
      if (toastRef.current) {
        toastRef.current.show({
          severity: 'info',
          summary: 'Procesando',
          detail: 'Registrando transferencia...',
          life: 1500
        });
      }

      setTimeout(() => {
        if (order.client?.hasCompleteData) {
          if (toastRef.current) {
            toastRef.current.show({
              severity: 'info',
              summary: 'Generando factura...',
              detail: 'Conectando con AFIP...',
              life: 1500
            });
          }
          setTimeout(() => {
            window.open('/mock-factura.pdf', '_blank');
            if (toastRef.current) {
              toastRef.current.show({
                severity: 'success',
                summary: 'Factura emitida ✅',
                detail: 'Pago registrado y facturado',
                life: 3000
              });
            }
            onConfirm({ method: 'eft_trans', amount, comprobante: uploadedFile });
            onHide();
          }, 1500);
        } else {
          const missingFields = [];
          if (!order.client.razonSocial) missingFields.push('Razón Social');
          if (!order.client.cuit) missingFields.push('CUIT');
          if (!order.client.ivaCondition) missingFields.push('Condición IVA');

          if (toastRef.current) {
            toastRef.current.show({
              severity: 'warning',
              summary: '⚠️ Datos incompletos. Generando remito...',
              detail: `Faltan: ${missingFields.join(', ')}. Admin facturará después.`,
              life: 4000
            });
          }
          setTimeout(() => {
            window.open('/mock-remito.pdf', '_blank');
            if (toastRef.current) {
              toastRef.current.show({
                severity: 'success',
                summary: 'Remito generado',
                detail: 'Remito generado. Admin facturará después.',
                life: 3000
              });
            }
            onConfirm({ method: 'eft_trans', amount, comprobante: uploadedFile });
            onHide();
          }, 1500);
        }
      }, 500);

    } else if (selectedMethod === 'no_pago') {
      if (toastRef.current) {
        toastRef.current.show({
          severity: 'info',
          summary: 'Actualizando saldo',
          detail: 'Se actualizará la cuenta corriente del cliente',
          life: 2000
        });
      }

      setTimeout(() => {
        onConfirm({ method: 'no_pago', amount: 0 });
        onHide();
      }, 1000);
    }
  };

  const calculateChange = () => {
    if (selectedMethod === 'efectivo' && amount > order.total) {
      return amount - order.total;
    }
    return 0;
  };

  return (
    <>
      <Toast ref={toastRef} />

      <Dialog
        visible={visible}
        onHide={onHide}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-wallet text-2xl"></i>
            <span>Registrar Pago</span>
          </div>
        }
        style={{ width: '90vw', maxWidth: '700px' }}
        modal
        dismissableMask
      >
        <div>
          <div className="mb-3">
            <h3 className="text-xl font-bold">Total a cobrar: {formatCurrency(order.total)}</h3>
            <p className="text-gray-600">Cliente: {order.client?.name}</p>
          </div>

          {!selectedMethod ? (
            <div className="grid">
              {/* Option 1: Efectivo */}
              <div className="col-12 md:col-4 mb-3">
                <Card
                  className="cursor-pointer hover:shadow-4 transition-duration-200 h-full"
                  onClick={() => handleMethodSelect('efectivo')}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3">💵</div>
                    <h3 className="text-xl font-bold mb-2">EFECTIVO</h3>
                    <p className="text-sm text-gray-600">Pago en efectivo con cambio</p>
                  </div>
                </Card>
              </div>

              {/* Option 2: EFT/TRANS */}
              <div className="col-12 md:col-4 mb-3">
                <Card
                  className="cursor-pointer hover:shadow-4 transition-duration-200 h-full"
                  onClick={() => handleMethodSelect('eft_trans')}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3">📱</div>
                    <h3 className="text-xl font-bold mb-2">EFT/TRANS</h3>
                    <p className="text-sm text-gray-600">Transferencia electrónica</p>
                  </div>
                </Card>
              </div>

              {/* Option 3: No Pagó */}
              <div className="col-12 md:col-4 mb-3">
                <Card
                  className="cursor-pointer hover:shadow-4 transition-duration-200 h-full"
                  onClick={() => handleMethodSelect('no_pago')}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3">⏳</div>
                    <h3 className="text-xl font-bold mb-2">NO PAGÓ HOY</h3>
                    <p className="text-sm text-gray-600">Actualizar cuenta corriente</p>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div>
              {/* Efectivo Form */}
              {selectedMethod === 'efectivo' && (
                <div>
                  <Card className="bg-green-50 mb-3">
                    <div className="text-center">
                      <div className="text-6xl mb-3">💵</div>
                      <h3 className="text-2xl font-bold">Pago en Efectivo</h3>
                    </div>
                  </Card>

                  <div className="mb-3">
                    <label className="block text-sm font-semibold mb-2">Monto recibido *</label>
                    <InputNumber
                      value={amount}
                      onValueChange={(e) => setAmount(e.value)}
                      mode="currency"
                      currency="ARS"
                      locale="es-AR"
                      className="w-full"
                      minFractionDigits={0}
                    />
                  </div>

                  {calculateChange() > 0 && (
                    <div className="p-3 bg-yellow-50 border-round mb-3">
                      <div className="flex justify-content-between align-items-center">
                        <span className="font-semibold">Cambio a entregar:</span>
                        <span className="text-2xl font-bold text-warning">{formatCurrency(calculateChange())}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EFT/TRANS Form */}
              {selectedMethod === 'eft_trans' && (
                <div>
                  <Card className="bg-blue-50 mb-3">
                    <div className="text-center">
                      <div className="text-6xl mb-3">📱</div>
                      <h3 className="text-2xl font-bold">Transferencia Electrónica</h3>
                    </div>
                  </Card>

                  <div className="mb-3">
                    <label className="block text-sm font-semibold mb-2">Monto *</label>
                    <InputNumber
                      value={amount}
                      onValueChange={(e) => setAmount(e.value)}
                      mode="currency"
                      currency="ARS"
                      locale="es-AR"
                      className="w-full"
                      minFractionDigits={0}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-semibold mb-2">Comprobante *</label>
                    <FileUpload
                      mode="basic"
                      name="comprobante"
                      accept="image/*"
                      maxFileSize={5000000}
                      onSelect={handleFileUpload}
                      chooseLabel="📸 Adjuntar comprobante"
                      className="w-full"
                    />
                  </div>

                  {imagePreview && (
                    <div className="mb-3">
                      <label className="block text-sm font-semibold mb-2">Vista previa:</label>
                      <img src={imagePreview} alt="Comprobante" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} />
                    </div>
                  )}
                </div>
              )}

              {/* No Pagó */}
              {selectedMethod === 'no_pago' && (
                <div>
                  <Card className="bg-orange-50 mb-3">
                    <div className="text-center">
                      <div className="text-6xl mb-3">⏳</div>
                      <h3 className="text-2xl font-bold">Cliente No Pagó Hoy</h3>
                    </div>
                  </Card>

                  <div className="p-3 bg-yellow-50 border-round">
                    <div className="flex align-items-center gap-2 mb-2">
                      <i className="pi pi-info-circle text-warning"></i>
                      <span className="font-semibold">Se actualizará el saldo del cliente</span>
                    </div>
                    <p className="text-sm m-0">
                      El monto de <strong>{formatCurrency(order.total)}</strong> se agregará a la cuenta corriente del cliente.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  label="Volver"
                  icon="pi pi-arrow-left"
                  className="p-button-secondary"
                  onClick={() => setSelectedMethod(null)}
                />
                <Button
                  label="Confirmar Pago"
                  icon="pi pi-check"
                  className="p-button-success flex-1"
                  onClick={handleConfirm}
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default PaymentModal;
