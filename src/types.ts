export type UserRole = 'admin' | 'technician' | 'client';

export type PriorityLevel = 'EMERGENCIA' | 'ALTA' | 'MEDIA' | 'PROGRAMADO';
export type OrderStatus = 'PENDIENTE' | 'EN_RUTA' | 'EN_EJECUCION' | 'FINALIZADA' | 'FACTURADA' | 'PROGRAMADO' | 'RECHAZADA';
export type ApprovalStatus = 'PENDIENTE_VALIDACION' | 'APROBADO_ENVIADO' | 'RECHAZADO_CORRECCION' | 'BORRADOR';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'EN_VERIFICACION' | 'ANULADA';

export type PaymentMethod =
  | 'PSE'
  | 'NEQUI'
  | 'DAVIPLATA'
  | 'EFECTIVO'
  | 'EFECTIVO_VERIFICADO'
  | 'BANCOLOMBIA'
  | 'OTROS_BANCOS'
  | 'TRANSFERENCIA_BANCARIA'
  | 'TARJETA';

export const COLOMBIAN_BANKS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Scotiabank Colpatria',
  'Banco Itaú',
  'Banco Caja Social',
  'Banco Agrario de Colombia',
  'Banco AV Villas',
  'Banco Falabella',
  'Banco Pichincha',
  'Banco Santander',
  'Banco Coopcentral',
  'Banco Serfinanza',
  'Banco Finandina',
  'Banco W',
  'Banco Mundo Mujer',
  'Lulo Bank',
  'Nu Colombia (Nubank)',
  'Ualá Colombia',
  'Dale!',
  'RappiPay',
  'Movii',
  'Nequi (Bancolombia)',
  'Daviplata (Davivienda)',
];

export interface BankAccount {
  id: string;
  bankName: string; // e.g. "Bancolombia", "Davivienda", "Nequi", "Daviplata", "Caja Menor Principal"
  accountType: 'CORRIENTE' | 'AHORROS' | 'BILLETERA_DIGITAL' | 'CAJA_EFECTIVO';
  accountNumber: string;
  holderName: string;
  holderDocument: string;
  currentBalanceCOP: number;
  isDefault: boolean;
  colorAccent?: string;
  description?: string;
}

export type BillCategory =
  | 'SERVICIO_PUBLICO_AGUA'
  | 'SERVICIO_PUBLICO_ENERGIA'
  | 'SERVICIO_PUBLICO_GAS'
  | 'SERVICIO_PUBLICO_INTERNET'
  | 'SERVICIO_PUBLICO_ASEO'
  | 'PROVEEDOR_REPUESTOS'
  | 'PROVEEDOR_TUBERIAS'
  | 'PROVEEDOR_EQUIPOS_BOMBAS'
  | 'PROVEEDOR_HERRAMIENTAS'
  | 'CONTRATISTA_EXTERNO'
  | 'ARRIENDO_SEDE'
  | 'OTRO_GASTO';

export type BillStatus = 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'ANULADO';

export interface SupplierBill {
  id: string;
  billNumber: string; // e.g., "FAC-PROV-9082" o NIC / Referencia de Pago
  supplierName: string; // e.g. "EAAB Acueducto Bogotá", "Enel Colombia", "Vanti Gas Natural", "ETB Fibra", "Corona S.A.S.", "Grival S.A.", "Barnes de Colombia", "Pavco Wavin", "SKF Latin Trade"
  supplierNitOrDocument: string;
  category: BillCategory;
  meterNumberOrServiceCode?: string; // Número de Cuenta / NIC / Matrícula
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotalCOP: number;
  taxCOP: number;
  totalCOP: number;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  bankAccountName?: string;
  paymentReference?: string;
  notes?: string;
  supportFileUrl?: string;
  authorizedBy?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'REPORT_SUBMITTED' | 'INVOICE_GENERATED' | 'REPORT_APPROVED' | 'REPORT_REJECTED' | 'PAYMENT_RECEIVED' | 'EMERGENCIA' | 'SERVICE_REQUESTED' | 'TECH_ASSIGNED' | 'PART_PURCHASED';
  targetRole: 'admin' | 'technician' | 'client' | 'all';
  targetClientId?: string;
  targetTechId?: string;
  orderId?: string;
  orderNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
  metadata?: Record<string, any>;
}

export interface ServiceRequestData {
  serviceType: string;
  urgencyLevel: string;
  equipmentType: string;
  specificType: string;
  housingType?: string;
  housingDescription?: string;
  suggestedDate: string;
  suggestedTime: string;
  problemDescription: string;
  photoPreviews?: string[];
  clientName: string;
  documentType: string;
  documentNumber: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  selectedSpareParts: { part: SparePart; quantity: number }[];
}

export interface SparePart {
  id: string;
  code: string; // SKU
  name: string;
  category: string;
  brand: string;
  description: string;
  imageUrl?: string;
  stock: number;
  minStock: number;
  unit: string;
  unitPriceCOP: number;
  warehouseLocation: string;
  updatedAt?: string;
}

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  billingEmail: string;
  website: string;
  dianResolutionNumber: string;
  dianResolutionDate: string;
  dianInvoicePrefix: string;
  dianFromNumber: number;
  dianToNumber: number;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankHolderName: string;
  logoUrl?: string;
  tagline?: string;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleTitle: string;
  avatarUrl?: string;
  signatureUrl?: string;
  department: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  unitPriceCOP: number;
  totalCOP: number;
}

export interface TechnicalReport {
  id: string;
  orderId: string;
  date: string;
  technicianName: string;
  technicianDocument: string;
  equipmentType: string;
  brand: string;
  model: string;
  hpPower: number;
  serialNumber: string;
  voltagePhase: 'Trifásico 220V' | 'Trifásico 440V' | 'Monofásico 220V' | 'Monofásico 110V';
  suctionPressurePsi: number;
  dischargePressurePsi: number;
  ampPhaseR: number;
  ampPhaseS: number;
  ampPhaseT: number;
  nominalAmperage: number;
  insulationResistanceMohm: number;
  vibrationMmS: number;
  generalStateBefore: 'CRÍTICO' | 'REGULAR' | 'BUENO';
  generalStateAfter: 'ÓPTIMO' | 'BUENO' | 'OBSERVACIÓN';
  materialsUsed: MaterialItem[];
  diagnosticDetails: string;
  workPerformed: string;
  recommendations: string;
  clientNameSigner: string;
  clientDocumentSigner: string;
  clientRoleSigner: string;
  clientSignatureDataUrl?: string;
  technicianSignatureDataUrl?: string;
  photoEvidenceUrls: string[];
  approvalStatus?: ApprovalStatus;
  adminNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
  sentToClientAt?: string;
}

export interface TechnicianGeolocationRecord {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  timestamp: string;
  distanceToSiteMeters?: number;
  verifiedOnSite: boolean;
  addressApprox?: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string; // e.g., OT-2026-084
  clientId?: string;
  clientName: string;
  clientNit: string;
  clientContact: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  neighborhood: string;
  city: string;
  coordinates: { lat: number; lng: number };
  housingType?: string;
  housingDescription?: string;
  equipmentType: string;
  brand: string;
  model: string;
  hpPower: number;
  priority: PriorityLevel;
  status: OrderStatus;
  scheduledDate: string;
  scheduledTime: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  reportedIssue: string;
  notes?: string;
  totalCostCOP: number;
  technicalReport?: TechnicalReport;
  invoiceId?: string;
  etaMinutes?: number;
  createdAt?: string;
  requestStatus?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  rejectionReason?: string;
  rejectedAt?: string;
  approvedAt?: string;
  serviceCategory?: string;
  requestedSpareParts?: { part: SparePart; quantity: number }[];
  startLocation?: TechnicianGeolocationRecord;
  serviceStartedAt?: string;
  dispatchVerified?: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCOP: number;
  totalCOP: number;
  isTaxable: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., FE-0924
  orderId?: string;
  orderNumber?: string;
  clientId?: string;
  clientName: string;
  clientNit: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotalCOP: number;
  iva19COP: number;
  retencionFuenteCOP: number; // 4% sobre mano de obra o compras
  totalCOP: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  approvalStatus?: ApprovalStatus;
  paidDate?: string;
  paymentReference?: string;
  cashReceiptNo?: string;
  cashReceivedBy?: string;
  dianCufe?: string;
  dianQrUrl?: string;
  dianStatus?: 'VALIDADA_DIAN' | 'BORRADOR_LOCAL' | 'EN_PROCESO_DIAN';
}

export interface Technician {
  id: string;
  fullName: string;
  documentType: 'Cédula de Ciudadanía' | 'Cédula de Extranjería' | 'Pasaporte' | 'PEP' | 'NIT';
  documentNumber: string;
  documentId: string; // Formatted document id (e.g. "CC 1.020.394.882")
  address: string;
  conteLicense: string; // Tarjeta profesional CONTE / COPNIA
  phone: string;
  email: string;
  username: string; // Asignado para ingreso a plataforma
  password?: string; // Contraseña asignada de acceso
  avatarUrl?: string;
  jobPosition?: string; // Cargo (e.g. "Técnica Especialista en Bombas y Variadores VFD", "Ingeniero Hidráulico")
  educationLevel?: string; // Nivel de Escolaridad (e.g. "Tecnólogo en Electromecánica (SENA)", "Profesional Universitario")
  specialty: 'Electrobombas y VFD' | 'Redes RCI & Contra Incendio' | 'Plantas Tratamiento & Osmosis' | 'Hidroneumáticos & Válvulas' | 'General Hidráulico';
  status: 'DISPONIBLE' | 'EN_RUTA' | 'EN_SERVICIO' | 'DESCANSO';
  currentLocationName: string;
  coordinates: { lat: number; lng: number };
  baseSalaryCOP: number;
  overtimeBonusCOP: number;
  completedOrdersCount: number;
  ratingScore: number;
  certifications: string[];
}

export interface InstalledEquipment {
  id: string;
  type: string;
  brand: string;
  model: string;
  hp: number;
  serial: string;
  locationInBuilding: string; // e.g. "Cuarto de Bombas Sótano 2"
  installDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  operatingHours: number;
  riskScore: number; // 0-100
  riskLevel: 'NORMAL' | 'MODERADO' | 'CRÍTICO';
}

export interface ClientAccount {
  id: string;
  companyName: string; // Nombre / Razón Social o Copropiedad
  documentType: 'NIT' | 'Cédula de Ciudadanía' | 'Cédula de Extranjería' | 'Pasaporte';
  documentNumber: string; // Número de identificación
  nit: string; // Identificación principal
  adminName: string; // Nombre de contacto / administrador
  clientRole: string; // Rol del cliente (e.g. "Administrador de Copropiedad", "Propietario", "Gerente de Operaciones")
  housingType?: string; // Tipo de Vivienda / Inmueble (e.g. "Conjunto Residencial", "Apartamento / Edificio", "Casa unifamiliar", etc.)
  housingDescription?: string; // Descripción opcional (e.g. "Torre 3, Apto 502 / Cuarto de bombas sótano 1")
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  username: string; // Asignado para ingreso a plataforma
  password?: string; // Contraseña asignada de acceso
  avatarUrl?: string; // Foto o logo del cliente
  contractType: 'PREVENTIVO_GOLD_MENSUAL' | 'PREVENTIVO_SILVER_BIMENSUAL' | 'POR_EVENTO';
  sanitaryCertificateValidUntil: string;
  equipments: InstalledEquipment[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'MANUAL_BOMBAS' | 'VARIADORES_VFD' | 'REDES_RCI' | 'NORMATIVA_DECRETO1575' | 'TABLEROS_ELECTRICOS' | 'VALVULAS_REGULADORAS';
  brandOrStandard: string;
  description: string;
  fileSize: string;
  minRoleRequired: UserRole;
  pagesCount: number;
  downloadUrl: string;
  updatedAt: string;
}

export interface HydraulicPredictionResult {
  riskLevel: 'CRÍTICO' | 'MODERADO' | 'NORMAL';
  riskPercentage: number;
  estimatedMTBFDays: number;
  cavitationRisk: 'ALTO' | 'MEDIO' | 'BAJO';
  thermalOverloadRisk: 'CRÍTICO' | 'MODERADO' | 'BAJO';
  imminentFailureProbability: string;
  probableRootCauses: string[];
  actionProtocol: string[];
  recommendedParts: string[];
  executiveSummary: string;
  source?: string;
}

export type CashTransactionType = 'INGRESO' | 'EGRESO';
export type CashCategory =
  | 'RECAUDO_SERVICIO'
  | 'VENTA_REPUESTO'
  | 'ANTICIPO_CLIENTE'
  | 'COMPRA_INSUMOS'
  | 'SERVICIO_PUBLICO'
  | 'VIATICOS_TRANSPORTE'
  | 'MANTENIMIENTO_HERRAMIENTAS'
  | 'OTRO_EGRESO'
  | 'OTRO_INGRESO';

export interface CashTransaction {
  id: string;
  receiptNumber: string;
  type?: CashTransactionType; // 'INGRESO' (suma a caja) o 'EGRESO' (resta de caja)
  date: string;
  orderNumber?: string;
  clientName?: string;
  clientOrBeneficiary?: string; // Nombre del cliente o beneficiario/proveedor
  amountCOP: number;
  receivedByTechnician?: string;
  authorizedByAdmin?: string;
  concept: string;
  category?: string; // e.g. "Recaudo Servicio Técnico", "Venta Repuesto", "Compra Insumos Ferretería", "Viáticos y Transporte", "Servicios Públicos", "Caja Menor"
  status: 'PENDIENTE_ARQUEO' | 'ARQUEADO_EN_CAJA' | 'DEPOSITADO_BANCO';
  verifiedByAdmin?: string;
  bankAccountId?: string;
  bankAccountName?: string;
}

export type ThemeColorId =
  | 'dark-sky'
  | 'dark-emerald'
  | 'dark-indigo'
  | 'dark-amber'
  | 'dark-rose'
  | 'dark-oled'
  | 'light-clean'
  | 'light-warm';

export interface ThemeOption {
  id: ThemeColorId;
  name: string;
  category: 'Oscuro' | 'Claro';
  isDark: boolean;
  accentColor: string;
  dotBg: string;
  badge: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark-sky',
    name: 'Azul Hidráulico (Original)',
    category: 'Oscuro',
    isDark: true,
    accentColor: 'sky',
    dotBg: 'bg-sky-500',
    badge: '🌊 Clásico',
    description: 'Tono azul marino de ingeniería con acentos cian.',
  },
  {
    id: 'dark-emerald',
    name: 'Esmeralda Ecológica',
    category: 'Oscuro',
    isDark: true,
    accentColor: 'emerald',
    dotBg: 'bg-emerald-500',
    badge: '🍃 Tratamiento',
    description: 'Verde esmeralda enfocado en aguas potables y residuales.',
  },
  {
    id: 'dark-indigo',
    name: 'Índigo Corporativo',
    category: 'Oscuro',
    isDark: true,
    accentColor: 'indigo',
    dotBg: 'bg-indigo-500',
    badge: '⚡ Alta Gama',
    description: 'Púrpura e índigo nocturno de alta distinción industrial.',
  },
  {
    id: 'dark-amber',
    name: 'Ámbar Eléctrico',
    category: 'Oscuro',
    isDark: true,
    accentColor: 'amber',
    dotBg: 'bg-amber-500',
    badge: '🔶 Potencia',
    description: 'Tonos ámbar y oro de alta visibilidad técnica.',
  },
  {
    id: 'dark-rose',
    name: 'Rubí RCI Incendios',
    category: 'Oscuro',
    isDark: true,
    accentColor: 'rose',
    dotBg: 'bg-rose-500',
    badge: '🚨 Protección RCI',
    description: 'Rojo carmesí de emergencia y redes contra incendios.',
  },
  {
    id: 'dark-oled',
    name: 'OLED Titanio Puro',
    category: 'Oscuro',
    isDark: true,
    accentColor: 'cyan',
    dotBg: 'bg-zinc-900 border border-zinc-600',
    badge: '🖤 Contraste Alto',
    description: 'Negro absoluto ultra nítido de bajo consumo visual.',
  },
  {
    id: 'light-clean',
    name: 'Blanco Ejecutivo',
    category: 'Claro',
    isDark: false,
    accentColor: 'sky',
    dotBg: 'bg-sky-600 ring-2 ring-slate-300',
    badge: '☀️ Día Cristalino',
    description: 'Lienzo blanco puro de alta claridad para oficinas y luz solar.',
  },
  {
    id: 'light-warm',
    name: 'Arena Cálida Suave',
    category: 'Claro',
    isDark: false,
    accentColor: 'amber',
    dotBg: 'bg-amber-600 ring-2 ring-amber-200',
    badge: '🌅 Confort Visual',
    description: 'Tono piedra cálido mate que reduce la fatiga ocular.',
  },
];
