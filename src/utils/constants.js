// SPEED UNLIMITED - Constants and Configuration
// Enhanced version with complete product catalog and business logic

export const ROLES = {
  ADMIN: 'admin',
  REPARTIDOR: 'repartidor'
};

export const ZONES = {
  SUR: { id: 'sur', name: 'Zona Sur', color: '#10B981' },
  SAN_TELMO: { id: 'san_telmo', name: 'San Telmo', color: '#8B5CF6' }
};

export const PRICE_LISTS = {
  LISTA_A: 'lista_a', // Standard price
  LISTA_B: 'lista_b', // -10% discount
  LISTA_C: 'lista_c'  // -15% discount
};

export const PRICE_LIST_LABELS = {
  [PRICE_LISTS.LISTA_A]: 'Lista A (Estándar)',
  [PRICE_LISTS.LISTA_B]: 'Lista B (-10%)',
  [PRICE_LISTS.LISTA_C]: 'Lista C (-15%)'
};

export const CATEGORIES = {
  BEBIDAS: 'bebidas',
  ENERGIZANTES: 'energizantes',
  AGUAS: 'aguas',
  ALCOHOLES: 'alcoholes',
  LICORES: 'licores'
};

// Complete product catalog with 3 price lists
export const PRODUCTS = [
  {
    id: 1,
    name: 'Speed 250ml',
    code: 'SPEED-250',
    category: CATEGORIES.ENERGIZANTES,
    description: 'Bebida energizante 250ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 1200,
      [PRICE_LISTS.LISTA_B]: 1080,
      [PRICE_LISTS.LISTA_C]: 1020
    },
    unit: 'lata',
    packSize: 24, // latas per pack
    stock: 245,
    minStock: 50
  },
  {
    id: 2,
    name: 'Speed XL 473ml',
    code: 'SPEED-473',
    category: CATEGORIES.ENERGIZANTES,
    description: 'Bebida energizante XL 473ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 1800,
      [PRICE_LISTS.LISTA_B]: 1620,
      [PRICE_LISTS.LISTA_C]: 1530
    },
    unit: 'lata',
    packSize: 24,
    stock: 180,
    minStock: 40
  },
  {
    id: 3,
    name: 'Speed Cola',
    code: 'SPEED-COLA',
    category: CATEGORIES.BEBIDAS,
    description: 'Speed Cola 350ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 1200,
      [PRICE_LISTS.LISTA_B]: 1080,
      [PRICE_LISTS.LISTA_C]: 1020
    },
    unit: 'lata',
    packSize: 24,
    stock: 150,
    minStock: 40
  },
  {
    id: 4,
    name: 'Agua BLOCK 500ml',
    code: 'AGUA-500',
    category: CATEGORIES.AGUAS,
    description: 'Agua mineral 500ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 800,
      [PRICE_LISTS.LISTA_B]: 720,
      [PRICE_LISTS.LISTA_C]: 680
    },
    unit: 'botella',
    packSize: 12,
    stock: 89,
    minStock: 30
  },
  {
    id: 5,
    name: 'Champagne',
    code: 'CHAMP',
    category: CATEGORIES.ALCOHOLES,
    description: 'Champagne 750ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 3900,
      [PRICE_LISTS.LISTA_B]: 3510,
      [PRICE_LISTS.LISTA_C]: 3315
    },
    unit: 'botella',
    packSize: 6,
    stock: 45,
    minStock: 10
  },
  {
    id: 6,
    name: 'Holmöser Licor 750ml',
    code: 'HOLM-LIC',
    category: CATEGORIES.LICORES,
    description: 'Holmöser Licor 750ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 4200,
      [PRICE_LISTS.LISTA_B]: 3780,
      [PRICE_LISTS.LISTA_C]: 3570
    },
    unit: 'botella',
    packSize: 6,
    stock: 32,
    minStock: 10
  },
  {
    id: 7,
    name: 'Holmöser Petaca 200ml',
    code: 'HOLM-PET',
    category: CATEGORIES.LICORES,
    description: 'Holmöser Petaca 200ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 1500,
      [PRICE_LISTS.LISTA_B]: 1350,
      [PRICE_LISTS.LISTA_C]: 1275
    },
    unit: 'petaca',
    packSize: 12,
    stock: 68,
    minStock: 20
  },
  {
    id: 8,
    name: 'Smirnoff 750ml',
    code: 'SMIRN',
    category: CATEGORIES.ALCOHOLES,
    description: 'Smirnoff Vodka 750ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 5500,
      [PRICE_LISTS.LISTA_B]: 4950,
      [PRICE_LISTS.LISTA_C]: 4675
    },
    unit: 'botella',
    packSize: 6,
    stock: 28,
    minStock: 10
  },
  {
    id: 9,
    name: 'Fernet 750ml',
    code: 'FERNET',
    category: CATEGORIES.ALCOHOLES,
    description: 'Fernet 750ml',
    prices: {
      [PRICE_LISTS.LISTA_A]: 4800,
      [PRICE_LISTS.LISTA_B]: 4320,
      [PRICE_LISTS.LISTA_C]: 4080
    },
    unit: 'botella',
    packSize: 12,
    stock: 2, // Critical stock
    minStock: 15
  }
];

export const ORDER_STATUS = {
  PENDIENTE: 'pendiente',
  EN_RUTA: 'en_ruta',
  ENTREGADO: 'entregado',
  DEVOLUCION_PARCIAL: 'devolucion_parcial',
  CANCELADO: 'cancelado',
  CONSIGNACION: 'consignacion'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDIENTE]: 'Pendiente',
  [ORDER_STATUS.EN_RUTA]: 'En Ruta',
  [ORDER_STATUS.ENTREGADO]: 'Entregado',
  [ORDER_STATUS.DEVOLUCION_PARCIAL]: 'Devolución Parcial',
  [ORDER_STATUS.CANCELADO]: 'Cancelado',
  [ORDER_STATUS.CONSIGNACION]: 'Consignación'
};

export const PAYMENT_STATUS = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  PARCIAL: 'parcial',
  NO_PAGO: 'no_pago'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDIENTE]: 'Pendiente',
  [PAYMENT_STATUS.PAGADO]: 'Pagado',
  [PAYMENT_STATUS.PARCIAL]: 'Pago Parcial',
  [PAYMENT_STATUS.NO_PAGO]: 'No Pagó'
};

export const PAYMENT_METHODS = {
  EFECTIVO: 'efectivo',
  EFT_TRANS: 'eft_trans', // Changed from "transferencia" to "EFT/TRANS"
  TARJETA: 'tarjeta',
  CUENTA_CORRIENTE: 'cuenta_corriente'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.EFECTIVO]: 'Efectivo',
  [PAYMENT_METHODS.EFT_TRANS]: 'EFT/TRANS',
  [PAYMENT_METHODS.TARJETA]: 'Tarjeta',
  [PAYMENT_METHODS.CUENTA_CORRIENTE]: 'Cuenta Corriente'
};

export const ORDER_TYPE = {
  NORMAL: 'normal',
  CONSIGNACION: 'consignacion'
};

export const ORDER_TYPE_LABELS = {
  [ORDER_TYPE.NORMAL]: 'Normal',
  [ORDER_TYPE.CONSIGNACION]: 'Consignación'
};

export const INVOICE_TYPES = {
  A: 'A',
  B: 'B',
  C: 'C',
  REMITO: 'REMITO' // For clients without complete fiscal data
};

export const INVOICE_TYPE_LABELS = {
  [INVOICE_TYPES.A]: 'Factura A',
  [INVOICE_TYPES.B]: 'Factura B',
  [INVOICE_TYPES.C]: 'Factura C',
  [INVOICE_TYPES.REMITO]: 'Remito (sin datos fiscales)'
};

export const CLIENT_TYPES = {
  KIOSCO: 'kiosco',
  BAR: 'bar',
  RESTAURANT: 'restaurant',
  CLUB: 'club',
  SUPERMERCADO: 'supermercado',
  OTRO: 'otro'
};

export const CLIENT_TYPE_LABELS = {
  [CLIENT_TYPES.KIOSCO]: 'Kiosco',
  [CLIENT_TYPES.BAR]: 'Bar',
  [CLIENT_TYPES.RESTAURANT]: 'Restaurant',
  [CLIENT_TYPES.CLUB]: 'Club/Disco',
  [CLIENT_TYPES.SUPERMERCADO]: 'Supermercado',
  [CLIENT_TYPES.OTRO]: 'Otro'
};

export const IVA_CONDITIONS = {
  RESPONSABLE_INSCRIPTO: 'responsable_inscripto',
  MONOTRIBUTO: 'monotributo',
  CONSUMIDOR_FINAL: 'consumidor_final',
  EXENTO: 'exento'
};

export const IVA_CONDITION_LABELS = {
  [IVA_CONDITIONS.RESPONSABLE_INSCRIPTO]: 'Responsable Inscripto',
  [IVA_CONDITIONS.MONOTRIBUTO]: 'Monotributo',
  [IVA_CONDITIONS.CONSUMIDOR_FINAL]: 'Consumidor Final',
  [IVA_CONDITIONS.EXENTO]: 'Exento'
};

export const VEHICLE_TYPES = {
  MOTO: 'moto',
  AUTO: 'auto',
  CAMIONETA: 'camioneta',
  UTILITARIO: 'utilitario'
};

// Default Speed Unlimited brand colors
export const BRAND_COLORS = {
  primary: '#E31E24',   // Speed Red
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6'
};

// App configuration
export const APP_CONFIG = {
  name: 'Speed Unlimited',
  version: '2.0.0',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  afipApiUrl: process.env.REACT_APP_AFIP_API_URL || 'https://wswhomo.afip.gov.ar',
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/jpg'],
  paginationDefaults: {
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50, 100]
  }
};

export default {
  ROLES,
  ZONES,
  PRICE_LISTS,
  PRICE_LIST_LABELS,
  CATEGORIES,
  PRODUCTS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  ORDER_TYPE,
  ORDER_TYPE_LABELS,
  INVOICE_TYPES,
  INVOICE_TYPE_LABELS,
  CLIENT_TYPES,
  CLIENT_TYPE_LABELS,
  IVA_CONDITIONS,
  IVA_CONDITION_LABELS,
  VEHICLE_TYPES,
  BRAND_COLORS,
  APP_CONFIG
};
