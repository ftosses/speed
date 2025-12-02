// SPEED UNLIMITED - Helper functions

/**
 * Format currency in Argentine Pesos
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date to dd/mm/yyyy
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date and time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format time only
 * @param {string|Date} date
 * @returns {string}
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Calculate discount amount
 * @param {number} subtotal
 * @param {number} discountPercent
 * @returns {number}
 */
export const calculateDiscount = (subtotal, discountPercent) => {
  if (!discountPercent || discountPercent === 0) return 0;
  return (subtotal * discountPercent) / 100;
};

/**
 * Calculate order total
 * @param {array} items - Array of {product, quantity, pricePerUnit}
 * @param {number} discountPercent
 * @returns {object} { subtotal, discount, total }
 */
export const calculateOrderTotal = (items, discountPercent = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.pricePerUnit);
  }, 0);

  const discount = calculateDiscount(subtotal, discountPercent);
  const total = subtotal - discount;

  return { subtotal, discount, total };
};

/**
 * Calculate IVA (21%)
 * @param {number} amount
 * @returns {object} { net, iva, total }
 */
export const calculateIVA = (amount) => {
  const net = amount / 1.21;
  const iva = amount - net;
  return {
    net: Math.round(net),
    iva: Math.round(iva),
    total: amount
  };
};

/**
 * Validate CUIT format (XX-XXXXXXXX-X)
 * @param {string} cuit
 * @returns {boolean}
 */
export const validateCUIT = (cuit) => {
  if (!cuit) return false;
  const cleaned = cuit.replace(/[^0-9]/g, '');
  return cleaned.length === 11;
};

/**
 * Format CUIT with dashes
 * @param {string} cuit
 * @returns {string}
 */
export const formatCUIT = (cuit) => {
  if (!cuit) return '';
  const cleaned = cuit.replace(/[^0-9]/g, '');
  if (cleaned.length !== 11) return cuit;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
};

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Argentina format)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length >= 10;
};

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Get stock status
 * @param {number} currentStock
 * @param {number} minStock
 * @returns {object} { status: 'ok'|'low'|'critical', severity: string }
 */
export const getStockStatus = (currentStock, minStock) => {
  if (currentStock <= minStock * 0.5) {
    return { status: 'critical', severity: 'danger', label: 'Crítico' };
  }
  if (currentStock <= minStock) {
    return { status: 'low', severity: 'warning', label: 'Bajo' };
  }
  return { status: 'ok', severity: 'success', label: 'OK' };
};

/**
 * Calculate price based on price list
 * @param {object} product
 * @param {string} priceList
 * @returns {number}
 */
export const getProductPrice = (product, priceList) => {
  if (!product || !product.prices) return 0;
  return product.prices[priceList] || product.prices.lista_a || 0;
};

/**
 * Generate invoice number
 * @param {number} pointOfSale
 * @param {number} invoiceNumber
 * @returns {string}
 */
export const generateInvoiceNumber = (pointOfSale, invoiceNumber) => {
  const pos = String(pointOfSale).padStart(4, '0');
  const num = String(invoiceNumber).padStart(8, '0');
  return `${pos}-${num}`;
};

/**
 * Check if client has complete fiscal data
 * @param {object} client
 * @returns {boolean}
 */
export const hasCompleteFiscalData = (client) => {
  if (!client) return false;
  return !!(
    client.razonSocial &&
    client.cuit &&
    client.ivaCondition &&
    client.address
  );
};

/**
 * Debounce function
 * @param {function} func
 * @param {number} wait
 * @returns {function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Download file
 * @param {blob|string} data
 * @param {string} filename
 * @param {string} mimeType
 */
export const downloadFile = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export data to CSV
 * @param {array} data
 * @param {string} filename
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    }).join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Get today's date at midnight
 * @returns {Date}
 */
export const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get today's date at end of day
 * @returns {Date}
 */
export const getTodayEnd = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

/**
 * Check if two dates are the same day
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  calculateDiscount,
  calculateOrderTotal,
  calculateIVA,
  validateCUIT,
  formatCUIT,
  validateEmail,
  validatePhone,
  formatPhone,
  getStockStatus,
  getProductPrice,
  generateInvoiceNumber,
  hasCompleteFiscalData,
  debounce,
  downloadFile,
  exportToCSV,
  getTodayStart,
  getTodayEnd,
  isSameDay
};
