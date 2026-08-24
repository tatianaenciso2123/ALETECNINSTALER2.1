import React, { useState, useEffect } from 'react';
import {
  UserRole,
  WorkOrder,
  Invoice,
  CashTransaction,
  Technician,
  ClientAccount,
  TechnicalReport,
  ThemeColorId,
  AppNotification,
  SparePart,
  CompanySettings,
  AdminProfile,
  SupplierBill,
  Supplier,
  BankAccount,
  PaymentMethod,
  TechnicianGeolocationRecord,
} from './types';
import {
  INITIAL_ORDERS,
  INITIAL_TECHNICIANS,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_ADMIN_PROFILES,
  INVENTORY_SPARE_PARTS,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_BILLS,
  INITIAL_BANK_ACCOUNTS,
} from './data/mockData';
import { LoginPage, AuthUser } from './components/auth/LoginPage';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WorkOrdersAuditControl } from './components/admin/WorkOrdersAuditControl';
import { FinanceModule } from './components/admin/FinanceModule';
import { InvoicingModule } from './components/admin/InvoicingModule';
import { SupplierBillsModule } from './components/admin/SupplierBillsModule';
import { SuppliersDirectory } from './components/admin/SuppliersDirectory';
import { TalentAndClients } from './components/admin/TalentAndClients';
import { TechnicianDashboard } from './components/field/TechnicianDashboard';
import { DigitalReportSheet } from './components/field/DigitalReportSheet';
import { HydraulicTools } from './components/field/HydraulicTools';
import { DispatchMap } from './components/field/DispatchMap';
import { ClientPortal } from './components/client/ClientPortal';
import { AIPredictivePanel } from './components/ai/AIPredictivePanel';
import { AdminProfileModal } from './components/admin/AdminProfileModal';
import { CompanySettingsModal } from './components/admin/CompanySettingsModal';
import { AcceptRequestModal } from './components/admin/AcceptRequestModal';
import { RejectRequestModal } from './components/admin/RejectRequestModal';
import { NotificationDetailModal } from './components/common/NotificationDetailModal';
import { ServiceRequestModal } from './components/common/ServiceRequestModal';
import { VisitsCalendar } from './components/common/VisitsCalendar';
import { MonthlyTechnicalReportsHistory } from './components/common/MonthlyTechnicalReportsHistory';
import { WarehouseInventory } from './components/admin/WarehouseInventory';
import { BrandLogo } from './components/BrandLogo';
import { formatCOP } from './utils/formatters';
import {
  AlertTriangle,
  CheckCircle2,
  Phone,
  Wrench,
  Clock,
  Send,
  Sparkles,
  Share2,
  Copy,
  RotateCcw,
  Trash2,
  Link,
  ShieldCheck,
  Check,
  Receipt,
  TrendingUp,
  Building2,
  FolderOpen,
  Building,
  Users,
  Boxes,
} from 'lucide-react';

const isCleanUrlMode = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('clean') === 'true' ||
      params.get('clean') === '1' ||
      params.get('shared') === 'true' ||
      params.get('shared') === '1' ||
      params.get('mode') === 'clean'
    );
  } catch {
    return false;
  }
};

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('ale_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Entities with LocalStorage Persistence
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    try {
      const saved = localStorage.getItem('ale_technicians_store');
      return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
    } catch {
      return INITIAL_TECHNICIANS;
    }
  });

  const [clients, setClients] = useState<ClientAccount[]>(() => {
    try {
      const saved = localStorage.getItem('ale_clients_store');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (isCleanUrlMode()) return [];
    try {
      const saved = localStorage.getItem('ale_notifications_store');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Save to LocalStorage whenever technicians, clients, or notifications change
  useEffect(() => {
    try {
      localStorage.setItem('ale_technicians_store', JSON.stringify(technicians));
    } catch {}
  }, [technicians]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_clients_store', JSON.stringify(clients));
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_notifications_store', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Global Role State
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('ale_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role || 'admin';
      }
    } catch {}
    return 'admin';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Theme Color and Dark Mode State
  const [currentTheme, setCurrentTheme] = useState<ThemeColorId>(() => {
    try {
      const saved = localStorage.getItem('ale_theme_preference');
      if (saved) return saved as ThemeColorId;
    } catch {}
    return 'dark-sky';
  });

  const isDarkMode = currentTheme.startsWith('dark');

  // Android Status Bar & System Color Mapping for each theme
  const THEME_ANDROID_HEX_MAP: Record<ThemeColorId, string> = {
    'dark-sky': '#020617',
    'dark-emerald': '#020f0a',
    'dark-indigo': '#050512',
    'dark-amber': '#0b0803',
    'dark-rose': '#0d0305',
    'dark-oled': '#000000',
    'light-clean': '#f8fafc',
    'light-warm': '#faf7f2',
  };

  // Theme & Dark Mode synchronization with HTML element & Android OS Status Bar
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Sync Android Status Bar and Browser Address Bar theme color
    const targetHex = THEME_ANDROID_HEX_MAP[currentTheme] || (isDarkMode ? '#020617' : '#f8fafc');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', targetHex);
    }

    // Call native Android Bridge if running inside Android WebView
    try {
      if ((window as any).AndroidBridge?.setTheme) {
        (window as any).AndroidBridge.setTheme(isDarkMode, targetHex);
      }
    } catch {}

    try {
      localStorage.setItem('ale_theme_preference', currentTheme);
    } catch {}
  }, [currentTheme, isDarkMode]);

  const handleToggleDarkMode = () => {
    setCurrentTheme((prev) => (prev.startsWith('dark') ? 'light-clean' : 'dark-sky'));
  };

  // Entities with LocalStorage Persistence & Clean URL mode support
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    if (isCleanUrlMode()) return [];
    try {
      const saved = localStorage.getItem('ale_orders_store');
      return saved !== null ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (isCleanUrlMode()) return [];
    try {
      const saved = localStorage.getItem('ale_invoices_store');
      return saved !== null ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    if (isCleanUrlMode()) return [];
    try {
      const saved = localStorage.getItem('ale_cash_store');
      return saved !== null ? JSON.parse(saved) : INITIAL_CASH_TRANSACTIONS;
    } catch {
      return INITIAL_CASH_TRANSACTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ale_orders_store', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_invoices_store', JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_cash_store', JSON.stringify(cashTransactions));
    } catch {}
  }, [cashTransactions]);

  // Supplier Directory, Supplier Bills and Bank Accounts State with LocalStorage Persistence
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (isCleanUrlMode()) return [];
    try {
      const saved = localStorage.getItem('ale_suppliers_store_v1');
      return saved !== null ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>(() => {
    if (isCleanUrlMode()) return [];
    try {
      const saved = localStorage.getItem('ale_supplier_bills_store');
      return saved !== null ? JSON.parse(saved) : INITIAL_SUPPLIER_BILLS;
    } catch {
      return INITIAL_SUPPLIER_BILLS;
    }
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem('ale_bank_accounts_store');
      return saved !== null ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
    } catch {
      return INITIAL_BANK_ACCOUNTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ale_suppliers_store_v1', JSON.stringify(suppliers));
    } catch {}
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_supplier_bills_store', JSON.stringify(supplierBills));
    } catch {}
  }, [supplierBills]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_bank_accounts_store', JSON.stringify(bankAccounts));
    } catch {}
  }, [bankAccounts]);

  // Spare Parts, Company Settings & Admin Profile with LocalStorage Persistence
  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    try {
      const saved = localStorage.getItem('ale_spare_parts_store_v3');
      return saved ? JSON.parse(saved) : INVENTORY_SPARE_PARTS;
    } catch {
      return INVENTORY_SPARE_PARTS;
    }
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem('ale_company_settings_store');
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
    } catch {
      return INITIAL_COMPANY_SETTINGS;
    }
  });

  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>(() => {
    try {
      const saved = localStorage.getItem('ale_admin_profiles_store');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_PROFILES;
    } catch {
      return INITIAL_ADMIN_PROFILES;
    }
  });

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    try {
      const saved = localStorage.getItem('ale_admin_profile_store');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_PROFILES[0];
    } catch {
      return INITIAL_ADMIN_PROFILES[0];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ale_spare_parts_store_v3', JSON.stringify(spareParts));
    } catch {}
  }, [spareParts]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_company_settings_store', JSON.stringify(companySettings));
    } catch {}
  }, [companySettings]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_admin_profile_store', JSON.stringify(adminProfile));
    } catch {}
  }, [adminProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('ale_admin_profiles_store', JSON.stringify(adminProfiles));
    } catch {}
  }, [adminProfiles]);

  // Modals state for corporate, warehouse, and detailed views
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [showCompanySettingsModal, setShowCompanySettingsModal] = useState(false);
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [selectedNotificationForDetail, setSelectedNotificationForDetail] = useState<AppNotification | null>(null);

  // Share and History Clean Modal State
  const [showShareCleanModal, setShowShareCleanModal] = useState(false);
  const [copyLinkToast, setCopyLinkToast] = useState(false);

  // Field / Tech Selection State
  const [selectedOrderForReport, setSelectedOrderForReport] = useState<WorkOrder | null>(null);

  // Service Request Approval / Rejection Modals State
  const [selectedOrderToAccept, setSelectedOrderToAccept] = useState<WorkOrder | null>(null);
  const [selectedOrderToReject, setSelectedOrderToReject] = useState<WorkOrder | null>(null);

  // Emergency Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyClient, setEmergencyClient] = useState(clients[0]?.companyName || '');
  const [emergencyIssue, setEmergencyIssue] = useState('');
  const [emergencyEquipType, setEmergencyEquipType] = useState('Bomba Sumergible Pozo / Aguas Negras');
  const [emergencyCreatedNotice, setEmergencyCreatedNotice] = useState(false);

  // Calculate pending validation count
  const pendingValidationCount = orders.filter(
    (o) => o.technicalReport?.approvalStatus === 'PENDIENTE_VALIDACION'
  ).length;

  // Strictly enforce RBAC: non-admin users cannot navigate away from their assigned role
  const effectiveRole: UserRole = currentUser
    ? currentUser.role === 'admin'
      ? currentRole
      : currentUser.role
    : 'admin';

  // Handle Login Success
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    try {
      localStorage.setItem('ale_auth_session', JSON.stringify(user));
    } catch {}

    if (user.role === 'admin') {
      setActiveTab('dashboard');
    } else if (user.role === 'technician') {
      setActiveTab('tech_agenda');
    } else if (user.role === 'client') {
      setActiveTab('client_portal');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ale_auth_session');
    } catch {}
  };

  // Adjust active tab when role changes (Only permitted for Admin)
  const handleRoleChange = (newRole: UserRole) => {
    if (currentUser?.role !== 'admin') {
      return;
    }
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setActiveTab('dashboard');
    } else if (newRole === 'technician') {
      setActiveTab('tech_agenda');
    } else if (newRole === 'client') {
      setActiveTab('client_portal');
    }
  };

  // CRUD Handlers for Technicians (Admin only)
  const handleAddTechnician = (newTech: Technician) => {
    setTechnicians((prev) => [newTech, ...prev]);
  };

  const handleUpdateTechnician = (updatedTech: Technician) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === updatedTech.id ? updatedTech : t))
    );
  };

  const handleDeleteTechnician = (techId: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== techId));
  };

  // CRUD Handlers for Clients (Admin only)
  const handleAddClient = (newClient: ClientAccount) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleUpdateClient = (updatedClient: ClientAccount) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  // Handlers for work orders
  const handleCreateOrder = (newOrderData: Partial<WorkOrder>) => {
    const newOrder: WorkOrder = {
      id: `ot-${Date.now()}`,
      orderNumber: `OT-2026-0${orders.length + 85}`,
      clientName: newOrderData.clientName || 'Cliente Particular',
      clientNit: newOrderData.clientNit || '900.548.120-1',
      clientContact: newOrderData.clientContact || 'Administración',
      clientPhone: newOrderData.clientPhone || '310 987 6543',
      clientEmail: newOrderData.clientEmail || 'contacto@copropiedad.com',
      clientAddress: newOrderData.clientAddress || 'Calle 100 # 15-20, Bogotá',
      neighborhood: newOrderData.neighborhood || 'Chicó',
      city: newOrderData.city || 'Bogotá D.C.',
      coordinates: newOrderData.coordinates || { lat: 4.7082, lng: -74.0305 },
      equipmentType: newOrderData.equipmentType || 'Sistema Hidroneumático',
      brand: newOrderData.brand || 'Barnes',
      model: newOrderData.model || 'B200',
      hpPower: newOrderData.hpPower || 10,
      reportedIssue: newOrderData.reportedIssue || 'Mantenimiento Preventivo Programado',
      priority: newOrderData.priority || 'PROGRAMADO',
      status: 'PENDIENTE',
      totalCostCOP: newOrderData.totalCostCOP || 1250000,
      assignedTechnicianId: technicians[0]?.id,
      assignedTechnicianName: technicians[0]?.fullName,
      scheduledDate: newOrderData.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newOrderData.scheduledTime || '09:00 AM',
    };

    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleStartServiceWithLocation = (
    orderId: string,
    geoRecord: TechnicianGeolocationRecord
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'EN_EJECUCION',
              startLocation: geoRecord,
              serviceStartedAt: geoRecord.timestamp,
              dispatchVerified: geoRecord.verifiedOnSite,
            }
          : o
      )
    );

    // Notify admin in real-time about dispatch compliance
    const currentOrder = orders.find((o) => o.id === orderId);
    const adminNotif: AppNotification = {
      id: `notif-dispatch-${Date.now()}`,
      title: 'Despacho en Ruta Validado con GPS',
      message: `El técnico ha iniciado el servicio de ${currentOrder?.orderNumber || 'OT'} (${currentOrder?.clientName}). Geoposición capturada: [${geoRecord.lat.toFixed(5)}, ${geoRecord.lng.toFixed(5)}] a ${geoRecord.distanceToSiteMeters ?? 0}m del predio.`,
      type: 'SERVICE_REQUESTED',
      targetRole: 'admin',
      orderId: orderId,
      orderNumber: currentOrder?.orderNumber,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'dispatch_map',
    };
    setNotifications((prev) => [adminNotif, ...prev]);
  };

  // Technician saves report -> creates notification + auto-generates invoice for admin validation
  const handleSaveReport = (orderId: string, report: TechnicalReport) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    const orderNum = currentOrder?.orderNumber || 'OT-2026';
    const clientName = currentOrder?.clientName || report.clientNameSigner || 'Cliente Copropiedad';
    
    // Calculate materials and labor
    const materialsCost = (report.materialsUsed || []).reduce((acc, m) => acc + (m.totalCOP || 0), 0);
    const laborCost = currentOrder?.totalCostCOP ? Math.max(currentOrder.totalCostCOP - materialsCost, 450000) : 650000;
    const subtotalCOP = laborCost + materialsCost;
    const iva19COP = Math.round(subtotalCOP * 0.19);
    const retencionFuenteCOP = Math.round(subtotalCOP * 0.04);
    const totalCOP = subtotalCOP + iva19COP;

    const newInvNumber = `FE-2026-0${invoices.length + 421}`;
    const newInvoiceId = `inv-${Date.now()}`;

    // 1. Update Order state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'FINALIZADA',
              technicalReport: {
                ...report,
                approvalStatus: 'PENDIENTE_VALIDACION',
              },
            }
          : o
      )
    );

    // 2. Automatically check and apply client advance payments to the invoice
    const matchingAdvances = cashTransactions.filter(
      (t) =>
        (t.type || 'INGRESO') === 'INGRESO' &&
        (t.category === 'ANTICIPO_CLIENTE' || t.concept.toLowerCase().includes('anticipo')) &&
        (
          (t.clientName && t.clientName.toLowerCase().trim() === clientName.toLowerCase().trim()) ||
          t.orderNumber === orderNum ||
          (t.clientOrBeneficiary && t.clientOrBeneficiary.toLowerCase().trim() === clientName.toLowerCase().trim())
        )
    );
    const advancePaymentCOP = matchingAdvances.reduce((acc, curr) => acc + curr.amountCOP, 0);
    const advanceReceiptNumber = matchingAdvances.map((t) => t.receiptNumber).join(', ');
    const netTotalCOP = Math.max(0, subtotalCOP + iva19COP - retencionFuenteCOP - advancePaymentCOP);

    const newInvoice: Invoice = {
      id: newInvoiceId,
      invoiceNumber: newInvNumber,
      orderId: orderId,
      orderNumber: orderNum,
      clientName: clientName,
      clientNit: currentOrder?.clientNit || '900.823.119-4',
      clientAddress: currentOrder?.clientAddress || 'Calle 127 # 19-45',
      clientEmail: currentOrder?.clientEmail || 'facturacion@copropiedad.com',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      paymentStatus: netTotalCOP === 0 ? 'PAGADO' : 'PENDIENTE',
      paymentMethod: netTotalCOP === 0 ? 'EFECTIVO' : undefined,
      subtotalCOP,
      iva19COP,
      retencionFuenteCOP,
      advancePaymentCOP: advancePaymentCOP > 0 ? advancePaymentCOP : undefined,
      advanceReceiptNumber: advanceReceiptNumber || undefined,
      totalCOP: netTotalCOP,
      items: [
        {
          id: `item-labor-${Date.now()}`,
          description: `Mantenimiento e Intervención Especializada Hidráulica - ${report.equipmentType}`,
          quantity: 1,
          unitPriceCOP: laborCost,
          totalCOP: laborCost,
          isTaxable: true,
        },
        ...(report.materialsUsed || []).map((m, idx) => ({
          id: `item-mat-${idx}-${Date.now()}`,
          description: `Repuesto: ${m.name} (Cód: ${m.code})`,
          quantity: m.quantity,
          unitPriceCOP: m.unitPriceCOP,
          totalCOP: m.totalCOP,
          isTaxable: true,
        })),
      ],
      dianCufe: `CUFE-PROV-${Date.now()}-DIAN-COLOMBIA-TECNINSTALER`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // 3. Automatically adjust stock in Warehouse for each material used
    if (report.materialsUsed && report.materialsUsed.length > 0) {
      setSpareParts((prevParts) =>
        prevParts.map((part) => {
          const used = report.materialsUsed.find(
            (m) => m.code === part.code || (part as any).sku === m.code || m.name.toLowerCase() === part.name.toLowerCase()
          );
          if (used) {
            return {
              ...part,
              stock: Math.max(0, part.stock - used.quantity),
            };
          }
          return part;
        })
      );
    }

    // 4. Automatically generate real-time notification for Admin
    const adminNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Nueva Ficha Técnica Recibida para Auditoría',
      message: `El técnico ${report.technicianName} guardó el reporte de ${orderNum} (${clientName}). Se generó la factura ${newInvNumber} ($${totalCOP.toLocaleString('es-CO')} COP) para validación del administrador.`,
      type: 'REPORT_SUBMITTED',
      targetRole: 'admin',
      orderId: orderId,
      orderNumber: orderNum,
      invoiceId: newInvoiceId,
      invoiceNumber: newInvNumber,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'audit_control',
    };

    setNotifications((prev) => [adminNotif, ...prev]);
  };

  // Service Request Handler (with Spare Parts Cart & Employee Assignment trigger)
  const handleCreateServiceRequest = (
    orderData: Partial<WorkOrder>,
    cartItems?: { part: SparePart; quantity: number }[]
  ) => {
    // 1. Deduct spare parts stock if purchased via cart
    if (cartItems && cartItems.length > 0) {
      setSpareParts((prevParts) =>
        prevParts.map((part) => {
          const item = cartItems.find((s) => s.part.id === part.id);
          if (item) {
            return {
              ...part,
              stock: Math.max(0, part.stock - item.quantity),
            };
          }
          return part;
        })
      );
    }

    // 2. Generate Work Order
    const orderNum = `OT-2026-0${orders.length + 86}`;
    const orderId = `ot-${Date.now()}`;
    const partsCost = (cartItems || []).reduce((acc, s) => acc + s.part.unitPriceCOP * s.quantity, 0);
    const baseServiceCost = orderData.totalCostCOP || (partsCost > 0 ? partsCost : 450000);

    const newOrder: WorkOrder = {
      id: orderId,
      orderNumber: orderNum,
      clientName: orderData.clientName || 'Cliente Solicitante',
      clientNit: orderData.clientNit || 'NIT-PENDIENTE',
      clientContact: orderData.clientName || 'Administración',
      clientPhone: orderData.clientPhone || '300 000 0000',
      clientEmail: orderData.clientEmail || 'contacto@copropiedad.com',
      clientAddress: orderData.clientAddress || 'Bogotá D.C.',
      neighborhood: 'Bogotá Metropolitana',
      city: 'Bogotá D.C.',
      coordinates: { lat: 4.711, lng: -74.0721 },
      equipmentType: orderData.equipmentType || 'Sistema Hidráulico',
      brand: orderData.brand || 'Barnes / Pedrollo',
      model: orderData.model || 'Central Hidráulica',
      hpPower: 10,
      reportedIssue: orderData.reportedIssue || 'Solicitud de servicio ingresada por cliente.',
      priority: orderData.priority || 'PROGRAMADO',
      status: 'PENDIENTE',
      totalCostCOP: baseServiceCost,
      scheduledDate: orderData.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: orderData.scheduledTime || '09:00 AM',
      assignedTechnicianId: undefined, // Requires Admin or Dispatch to assign employee
      assignedTechnicianName: undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 3. Real-time notification for Admin to assign employee
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Nueva Solicitud: ${newOrder.orderNumber} (${newOrder.priority})`,
      message: `${newOrder.clientName} ha solicitado servicio de ${newOrder.equipmentType}. Requiere asignación de técnico responsable.`,
      type: 'SERVICE_REQUESTED',
      targetRole: 'admin',
      orderId: orderId,
      orderNumber: orderNum,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'visits_calendar',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setShowServiceRequestModal(false);
  };

  // Assign Technician & enable digital report sheet
  const handleAssignTechnician = (orderId: string, techId: string) => {
    const tech = technicians.find((t) => t.id === techId);
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!tech || !targetOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assignedTechnicianId: techId,
              assignedTechnicianName: tech.fullName,
              status: o.status === 'PENDIENTE' ? 'EN_EJECUCION' : o.status,
            }
          : o
      )
    );

    // Notification for Technician: Report sheet is enabled
    const techNotif: AppNotification = {
      id: `notif-tech-${Date.now()}`,
      title: `Servicio Asignado: ${targetOrder.orderNumber}`,
      message: `Se te ha asignado el servicio en ${targetOrder.clientName}. La Hoja de Reporte Técnico ha sido habilitada para diligenciamiento.`,
      type: 'TECH_ASSIGNED',
      targetRole: 'technician',
      orderId: orderId,
      orderNumber: targetOrder.orderNumber,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'tech_report',
    };
    setNotifications((prev) => [techNotif, ...prev]);
  };

  // Spare Parts Inventory Handlers
  const handleAddSparePart = (newPart: Omit<SparePart, 'id'>) => {
    const part: SparePart = {
      ...newPart,
      id: `part-${Date.now()}`,
    };
    setSpareParts((prev) => [part, ...prev]);
  };

  const handleUpdateSparePartById = (id: string, updated: Partial<SparePart>) => {
    setSpareParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p))
    );
  };

  const handleDeleteSparePart = (id: string) => {
    setSpareParts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleQuickStockAdjust = (id: string, newStock: number, reason: string) => {
    setSpareParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p))
    );
  };

  // Admin approves technical report and dispatches invoice & copy to client
  const handleApproveReport = (orderId: string, adminNotes?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const orderNum = targetOrder?.orderNumber || 'OT';
    const clientName = targetOrder?.clientName || 'Cliente';

    // Update order report status to APROBADO_ENVIADO
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.technicalReport
          ? {
              ...o,
              technicalReport: {
                ...o.technicalReport,
                approvalStatus: 'APROBADO_ENVIADO',
                adminNotes: adminNotes || 'Reporte validado y certificado por Dirección Técnica.',
              },
            }
          : o
      )
    );

    // Generate notification for client & technician
    const clientNotif: AppNotification = {
      id: `notif-appr-cli-${Date.now()}`,
      title: `Ficha Técnica y Factura Aprobadas - ${orderNum}`,
      message: `ALE. TECNINSTALER ha validado formalmente la ficha técnica y la factura electrónica de ${clientName}. Puede consultar el reporte completo y realizar su pago en el portal.`,
      type: 'REPORT_APPROVED',
      targetRole: 'all',
      orderId: orderId,
      orderNumber: orderNum,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'client_invoices',
    };

    setNotifications((prev) => [clientNotif, ...prev]);
  };

  // Admin rejects technical report back to technician for review/correction
  const handleRejectReport = (orderId: string, adminNotes: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const orderNum = targetOrder?.orderNumber || 'OT';

    // Update order report status to RECHAZADO_CORRECCION
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.technicalReport
          ? {
              ...o,
              technicalReport: {
                ...o.technicalReport,
                approvalStatus: 'RECHAZADO_CORRECCION',
                adminNotes: adminNotes,
              },
            }
          : o
      )
    );

    // Generate notification for technician
    const techNotif: AppNotification = {
      id: `notif-rej-tech-${Date.now()}`,
      title: `Corrección Solicitada en Ficha Técnica - ${orderNum}`,
      message: `La administración devolvió el reporte para ajuste: "${adminNotes}". Por favor revise y actualice el acta.`,
      type: 'REPORT_REJECTED',
      targetRole: 'technician',
      orderId: orderId,
      orderNumber: orderNum,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'tech_agenda',
    };

    setNotifications((prev) => [techNotif, ...prev]);
  };

  // Admin Accepts and Schedules Service Request
  const handleAcceptServiceRequest = (
    orderId: string,
    assignedTechId: string,
    scheduledDate: string,
    scheduledTime: string,
    adminNotes?: string
  ) => {
    const tech = technicians.find((t) => t.id === assignedTechId);
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'PROGRAMADO',
              requestStatus: 'APROBADA',
              assignedTechnicianId: assignedTechId,
              assignedTechnicianName: tech ? tech.fullName : o.assignedTechnicianName,
              scheduledDate: scheduledDate || o.scheduledDate,
              scheduledTime: scheduledTime || o.scheduledTime,
              approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              notes: adminNotes ? `${o.notes ? o.notes + ' | ' : ''}Aprobación: ${adminNotes}` : o.notes,
            }
          : o
      )
    );

    // 1. Notification to CLIENT
    const clientNotif: AppNotification = {
      id: `notif-cli-appr-${Date.now()}`,
      title: `¡Solicitud Aprobada! ${targetOrder.orderNumber}`,
      message: `Tu solicitud de servicio para ${targetOrder.equipmentType} ha sido APROBADA. Visita programada para el ${scheduledDate} (${scheduledTime}). Técnico asignado: ${tech ? tech.fullName : 'Cuadrilla Técnica'}.`,
      type: 'SERVICE_REQUESTED',
      targetRole: 'client',
      orderId: orderId,
      orderNumber: targetOrder.orderNumber,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'status',
    };

    // 2. Notification to TECHNICIAN
    const techNotif: AppNotification = {
      id: `notif-tech-appr-${Date.now()}`,
      title: `Nuevo Servicio Asignado: ${targetOrder.orderNumber}`,
      message: `Se te ha asignado la orden para ${targetOrder.clientName} (${targetOrder.equipmentType}) programada para el ${scheduledDate} (${scheduledTime}).`,
      type: 'TECH_ASSIGNED',
      targetRole: 'technician',
      orderId: orderId,
      orderNumber: targetOrder.orderNumber,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'tech_agenda',
    };

    setNotifications((prev) => [clientNotif, techNotif, ...prev]);
    setSelectedOrderToAccept(null);
  };

  // Admin Rejects Service Request with description/reason
  const handleRejectServiceRequest = (orderId: string, rejectionReason: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'RECHAZADA',
              requestStatus: 'RECHAZADA',
              rejectionReason: rejectionReason,
              rejectedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : o
      )
    );

    // Notification to CLIENT with exact rejection description
    const clientNotif: AppNotification = {
      id: `notif-cli-rej-${Date.now()}`,
      title: `Solicitud Rechazada: ${targetOrder.orderNumber}`,
      message: `Motivo: "${rejectionReason}". Puedes ingresar al portal para revisar los detalles o enviar una nueva solicitud ajustada.`,
      type: 'SERVICE_REQUESTED',
      targetRole: 'client',
      orderId: orderId,
      orderNumber: targetOrder.orderNumber,
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'status',
    };

    setNotifications((prev) => [clientNotif, ...prev]);
    setSelectedOrderToReject(null);
  };

  const handleAddCashTransaction = (tx: CashTransaction) => {
    setCashTransactions((prev) => [tx, ...prev]);

    // If it's a client advance payment (ANTICIPO_CLIENTE), automatically discount it from the client's final invoice
    if (
      (tx.type || 'INGRESO') === 'INGRESO' &&
      (tx.category === 'ANTICIPO_CLIENTE' || (tx.concept && tx.concept.toLowerCase().includes('anticipo')))
    ) {
      const clientTarget = (tx.clientName || tx.clientOrBeneficiary || '').toLowerCase().trim();
      const orderTarget = tx.orderNumber?.toLowerCase().trim();

      let discounted = false;
      let matchedInvNum = '';
      let matchedClient = tx.clientName || 'Cliente';

      setInvoices((prevInvoices) => {
        return prevInvoices.map((inv) => {
          const matchClient =
            clientTarget &&
            (inv.clientName.toLowerCase().trim() === clientTarget ||
              inv.clientName.toLowerCase().includes(clientTarget) ||
              clientTarget.includes(inv.clientName.toLowerCase().trim()));
          const matchOrder = orderTarget && inv.orderNumber && inv.orderNumber.toLowerCase().trim() === orderTarget;

          if ((matchClient || matchOrder) && !discounted) {
            discounted = true;
            matchedInvNum = inv.invoiceNumber;
            matchedClient = inv.clientName;
            const currentAdvance = inv.advancePaymentCOP || 0;
            const newAdvance = currentAdvance + tx.amountCOP;
            const baseGross = inv.subtotalCOP + inv.iva19COP - (inv.retencionFuenteCOP || 0);
            const newTotalCOP = Math.max(0, baseGross - newAdvance);

            return {
              ...inv,
              advancePaymentCOP: newAdvance,
              advanceReceiptNumber: inv.advanceReceiptNumber
                ? `${inv.advanceReceiptNumber}, ${tx.receiptNumber}`
                : tx.receiptNumber,
              totalCOP: newTotalCOP,
              paymentStatus: newTotalCOP === 0 ? 'PAGADO' : inv.paymentStatus,
              paymentMethod: newTotalCOP === 0 ? 'EFECTIVO' : inv.paymentMethod,
              paidDate: newTotalCOP === 0 ? new Date().toISOString().slice(0, 10) : inv.paidDate,
            };
          }
          return inv;
        });
      });

      // Real-time Notification
      const notif: AppNotification = {
        id: `notif-adv-${Date.now()}`,
        title: 'Anticipo Aplicado a Factura Final',
        message: `Se registró el recibo de anticipo ${tx.receiptNumber} por ${formatCOP(tx.amountCOP)} de ${matchedClient}. El anticipo se descontó automáticamente de la factura final del cliente.`,
        type: 'INVOICE_GENERATED',
        targetRole: 'admin',
        timestamp: 'Justo ahora',
        read: false,
        actionTab: 'invoicing_dian',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const handleAddSupplierBill = (bill: SupplierBill) => {
    setSupplierBills([bill, ...supplierBills]);
    const notif: AppNotification = {
      id: `notif-bill-${Date.now()}`,
      title: 'Factura Radicada',
      message: `Se radicó factura por pagar ${bill.billNumber} de ${bill.supplierName} por ${formatCOP(bill.totalCOP)}`,
      type: 'INVOICE_GENERATED',
      targetRole: 'admin',
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'supplier_bills',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handlePaySupplierBill = (billId: string, method: PaymentMethod, bankAccountId: string, paymentRef: string) => {
    const targetAccount = bankAccounts.find((a) => a.id === bankAccountId);
    const targetBill = supplierBills.find((b) => b.id === billId);

    if (targetBill && targetAccount) {
      // Deduct balance from bank account
      setBankAccounts((prev) =>
        prev.map((acc) =>
          acc.id === bankAccountId
            ? { ...acc, currentBalanceCOP: Math.max(0, acc.currentBalanceCOP - targetBill.totalCOP) }
            : acc
        )
      );

      // If paid via petty cash (EFECTIVO), record as expense in CashTransactions
      if (method === 'EFECTIVO' || targetAccount.accountType === 'CAJA_EFECTIVO') {
        const cashExpense: CashTransaction = {
          id: `cash-exp-${Date.now()}`,
          receiptNumber: `CE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'EGRESO',
          category: 'SERVICIO_PUBLICO',
          clientName: targetBill.supplierName,
          amountCOP: targetBill.totalCOP,
          receivedByTechnician: 'Tesorería / Pagos',
          concept: `Pago de factura ${targetBill.billNumber} (${targetBill.supplierName})`,
          status: 'ARQUEADO_EN_CAJA',
          bankAccountId: targetAccount.id,
        };
        setCashTransactions((prev) => [cashExpense, ...prev]);
      }
    }

    setSupplierBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: 'PAGADO',
              paidDate: new Date().toISOString().slice(0, 10),
              paymentMethod: method,
              bankAccountId: bankAccountId,
              bankAccountName: targetAccount ? `${targetAccount.bankName} (${targetAccount.accountNumber})` : undefined,
              paymentReference: paymentRef,
            }
          : b
      )
    );
  };

  const handleDeleteSupplierBill = (billId: string) => {
    setSupplierBills((prev) => prev.filter((b) => b.id !== billId));
  };

  // Supplier Directory CRUD Handlers
  const handleAddSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);

    const notif: AppNotification = {
      id: `notif-supp-${Date.now()}`,
      title: 'Nuevo Proveedor Registrado',
      message: `Se ha registrado al proveedor "${newSupplier.name}" (${newSupplier.nitOrDocument}) en el directorio comercial.`,
      type: 'INVOICE_GENERATED',
      targetRole: 'admin',
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'suppliers',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleUpdateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const handleDeleteSupplier = (id: string) => {
    const supplierToDelete = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));

    if (supplierToDelete) {
      const notif: AppNotification = {
        id: `notif-supp-del-${Date.now()}`,
        title: 'Proveedor Eliminado',
        message: `El proveedor "${supplierToDelete.name}" ha sido eliminado del directorio.`,
        type: 'INVOICE_GENERATED',
        targetRole: 'admin',
        timestamp: 'Justo ahora',
        read: false,
        actionTab: 'suppliers',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const handleAddBankAccount = (account: BankAccount) => {
    setBankAccounts((prev) => [...prev, account]);
  };

  const handleUpdateBankAccountBalance = (accountId: string, newBalance: number) => {
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, currentBalanceCOP: newBalance } : acc))
    );
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: any, method?: any) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paymentStatus: status,
              paymentMethod: method || 'PSE',
              paidAt: new Date().toISOString(),
            }
          : inv
      )
    );
  };

  // Delete invoice (for test records or human error)
  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));

    const notif: AppNotification = {
      id: `notif-del-inv-${Date.now()}`,
      title: 'Factura Eliminada',
      message: `La factura con ID ${invoiceId} ha sido eliminada permanentemente del sistema contable.`,
      type: 'INVOICE_GENERATED',
      targetRole: 'admin',
      timestamp: 'Justo ahora',
      read: false,
      actionTab: 'invoicing',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Reset history to zero (clean slate)
  const handleResetHistoryToZero = () => {
    setOrders([]);
    setInvoices([]);
    setCashTransactions([]);
    setSupplierBills([]);
    setNotifications([]);
    try {
      localStorage.setItem('ale_orders_store', JSON.stringify([]));
      localStorage.setItem('ale_invoices_store', JSON.stringify([]));
      localStorage.setItem('ale_cash_store', JSON.stringify([]));
      localStorage.setItem('ale_supplier_bills_store', JSON.stringify([]));
      localStorage.setItem('ale_notifications_store', JSON.stringify([]));
      localStorage.setItem('ale_quick_access_visible', 'false');
    } catch {}
    setShowShareCleanModal(false);
  };

  // Restore initial demo dataset
  const handleRestoreDemoData = () => {
    setOrders(INITIAL_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setCashTransactions(INITIAL_CASH_TRANSACTIONS);
    setSupplierBills(INITIAL_SUPPLIER_BILLS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.setItem('ale_orders_store', JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem('ale_invoices_store', JSON.stringify(INITIAL_INVOICES));
      localStorage.setItem('ale_cash_store', JSON.stringify(INITIAL_CASH_TRANSACTIONS));
      localStorage.setItem('ale_supplier_bills_store', JSON.stringify(INITIAL_SUPPLIER_BILLS));
      localStorage.setItem('ale_bank_accounts_store', JSON.stringify(INITIAL_BANK_ACCOUNTS));
      localStorage.setItem('ale_notifications_store', JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem('ale_quick_access_visible', 'true');
    } catch {}
    setShowShareCleanModal(false);
  };

  const getCleanShareUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?shared=true`;
  };

  const handleCopyCleanLink = () => {
    const url = getCleanShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopyLinkToast(true);
    setTimeout(() => setCopyLinkToast(false), 3000);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Notification Direct Navigation to Module & Content Handler
  const handleNavigateFromNotification = (tab: string, meta?: any) => {
    // 1. Role alignment if notification is role-specific
    if (meta?.targetRole && meta.targetRole !== 'all') {
      setCurrentRole(meta.targetRole);
    }

    // 2. Set target tab
    setActiveTab(tab);

    // 3. Target order / invoice selection for immediate deep dive
    if (meta?.orderId || meta?.orderNumber) {
      const matchedOrder = orders.find(
        (o) => o.id === meta.orderId || o.orderNumber === meta.orderNumber
      );
      if (matchedOrder) {
        setSelectedOrderForReport(matchedOrder);
      }
    }

    setSelectedNotificationForDetail(null);
  };

  // Emergency Modal Submission
  const handleTriggerEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyIssue) return;

    handleCreateOrder({
      clientName: emergencyClient,
      reportedIssue: `[URGENCIA CRÍTICA] ${emergencyIssue}`,
      equipmentType: emergencyEquipType,
      priority: 'EMERGENCIA',
    });

    setEmergencyCreatedNotice(true);
    setTimeout(() => {
      setEmergencyCreatedNotice(false);
      setShowEmergencyModal(false);
      setEmergencyIssue('');
    }, 2000);
  };

  // Client currently logged in matching data
  const currentClientAccount = clients.find(
    (c) =>
      c.username?.toLowerCase() === currentUser?.username?.toLowerCase() ||
      c.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
      c.nit?.toLowerCase() === currentUser?.nitOrDocument?.toLowerCase()
  ) || clients[0];

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        currentTheme={currentTheme}
        onChangeTheme={(themeId) => setCurrentTheme(themeId)}
        technicians={technicians}
        clients={clients}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      {/* Universal Top Navigation Header */}
      <Navbar
        currentRole={effectiveRole}
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        currentTheme={currentTheme}
        currentUser={currentUser}
        notifications={notifications}
        pendingValidationCount={pendingValidationCount}
        onRoleChange={handleRoleChange}
        onTabChange={(tab) => {
          setSelectedOrderForReport(null);
          setActiveTab(tab);
        }}
        onToggleDarkMode={handleToggleDarkMode}
        onChangeTheme={(themeId) => setCurrentTheme(themeId)}
        onTriggerEmergency={() => setShowEmergencyModal(true)}
        onLogout={handleLogout}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onSelectNotification={(notif) => setSelectedNotificationForDetail(notif)}
        onOpenShareCleanModal={() => setShowShareCleanModal(true)}
        onOpenAdminProfile={() => setShowAdminProfileModal(true)}
        onOpenCompanySettings={() => setShowCompanySettingsModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-full overflow-x-hidden">
        {/* ======================= ADMIN PILLAR ======================= */}
        {effectiveRole === 'admin' && (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                orders={orders}
                technicians={technicians}
                clients={clients}
                invoices={invoices}
                spareParts={spareParts}
                companySettings={companySettings}
                adminProfile={adminProfile}
                onOpenNewOrder={() => setShowServiceRequestModal(true)}
                onOpenServiceRequest={() => setShowServiceRequestModal(true)}
                onOpenAdminProfile={() => setShowAdminProfileModal(true)}
                onOpenCompanySettings={() => setShowCompanySettingsModal(true)}
                onAcceptRequest={(order) => setSelectedOrderToAccept(order)}
                onRejectRequest={(order) => setSelectedOrderToReject(order)}
                onSelectOrder={(order) => {
                  setSelectedOrderForReport(order);
                  setActiveTab('audit_control');
                }}
                onSelectTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'visits_calendar' && (
              <VisitsCalendar
                orders={orders}
                technicians={technicians}
                onSelectOrder={(order) => {
                  setSelectedOrderForReport(order);
                  setActiveTab('audit_control');
                }}
                onAssignTechnician={handleAssignTechnician}
                onOpenNewVisit={() => setShowServiceRequestModal(true)}
                onOpenReportSheet={(order) => {
                  setSelectedOrderForReport(order);
                  setActiveTab('tech_report');
                }}
                currentRole={effectiveRole}
              />
            )}

            {activeTab === 'warehouse' && (
              <WarehouseInventory
                spareParts={spareParts}
                onAddSparePart={handleAddSparePart}
                onUpdateSparePart={handleUpdateSparePartById}
                onDeleteSparePart={handleDeleteSparePart}
                onQuickStockAdjust={handleQuickStockAdjust}
              />
            )}

            {activeTab === 'audit_control' && (
              <WorkOrdersAuditControl
                orders={orders}
                invoices={invoices}
                onApproveReport={handleApproveReport}
                onRejectReport={handleRejectReport}
                onViewInvoice={(invoiceId) => {
                  setActiveTab('invoicing');
                }}
              />
            )}

            {activeTab === 'tech_reports_history' && (
              <MonthlyTechnicalReportsHistory
                orders={orders}
                invoices={invoices}
                technicians={technicians}
                clients={clients}
                onSelectOrderForReport={(order) => {
                  setSelectedOrderForReport(order);
                  setActiveTab('tech_report');
                }}
                onViewInvoice={(invoiceId) => {
                  setActiveTab('invoicing');
                }}
                onApproveReport={handleApproveReport}
                onRejectReport={handleRejectReport}
                currentRole={effectiveRole}
              />
            )}

            {activeTab === 'invoicing' && (
              <InvoicingModule
                invoices={invoices}
                onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                onApproveInvoice={(invId) => handleUpdateInvoiceStatus(invId, 'PAGADO')}
                onSendInvoiceToClient={(invId) => {}}
                onDeleteInvoice={handleDeleteInvoice}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceModule
                invoices={invoices}
                cashTransactions={cashTransactions}
                orders={orders}
                technicians={technicians}
                clients={clients}
                onAddCashTransaction={handleAddCashTransaction}
                onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              />
            )}

            {activeTab === 'supplier_bills' && (
              <SupplierBillsModule
                supplierBills={supplierBills}
                bankAccounts={bankAccounts}
                onAddSupplierBill={handleAddSupplierBill}
                onPaySupplierBill={handlePaySupplierBill}
                onDeleteSupplierBill={handleDeleteSupplierBill}
                onAddBankAccount={handleAddBankAccount}
                onUpdateBankAccountBalance={handleUpdateBankAccountBalance}
              />
            )}

            {activeTab === 'clients' && (
              <TalentAndClients
                technicians={technicians}
                clients={clients}
                defaultTab="clients"
                onAddTechnician={handleAddTechnician}
                onUpdateTechnician={handleUpdateTechnician}
                onDeleteTechnician={handleDeleteTechnician}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
              />
            )}

            {(activeTab === 'technicians' || activeTab === 'talent' || activeTab === 'talent_clients') && (
              <TalentAndClients
                technicians={technicians}
                clients={clients}
                defaultTab="technicians"
                onAddTechnician={handleAddTechnician}
                onUpdateTechnician={handleUpdateTechnician}
                onDeleteTechnician={handleDeleteTechnician}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersDirectory
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
            )}

            {activeTab === 'dispatch_map' && (
              <DispatchMap
                technicians={technicians}
                orders={orders}
                onAssignTechnician={(orderId, techId) => handleAssignTechnician(orderId, techId)}
              />
            )}

            {activeTab === 'predictive_ai' && <AIPredictivePanel />}
            {activeTab === 'hydraulic_tools' && <HydraulicTools />}
          </>
        )}

        {/* ======================= FIELD TECHNICIAN PILLAR ======================= */}
        {effectiveRole === 'technician' && (
          <>
            {/* If a specific order is selected for digital report */}
            {selectedOrderForReport ? (
              <DigitalReportSheet
                order={selectedOrderForReport}
                spareParts={spareParts}
                onSaveReport={(orderId, report) => {
                  handleSaveReport(orderId, report);
                  setSelectedOrderForReport(null);
                  setActiveTab('tech_agenda');
                }}
                onBack={() => setSelectedOrderForReport(null)}
              />
            ) : (
              <>
                {activeTab === 'tech_agenda' && (
                  <TechnicianDashboard
                    orders={orders}
                    technicians={technicians}
                    onSelectOrderForReport={(order) => setSelectedOrderForReport(order)}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onStartServiceWithLocation={handleStartServiceWithLocation}
                    onOpenHydraulicTools={() => setActiveTab('hydraulic_tools')}
                  />
                )}

                {activeTab === 'visits_calendar' && (
                  <VisitsCalendar
                    orders={orders}
                    technicians={technicians}
                    onSelectOrder={(order) => {
                      setSelectedOrderForReport(order);
                      setActiveTab('tech_report');
                    }}
                    onAssignTechnician={handleAssignTechnician}
                    onOpenNewVisit={() => setShowServiceRequestModal(true)}
                    onOpenReportSheet={(order) => {
                      setSelectedOrderForReport(order);
                      setActiveTab('tech_report');
                    }}
                    currentRole={effectiveRole}
                    currentTechId={currentUser?.id}
                  />
                )}

                {activeTab === 'tech_reports_history' && (
                  <MonthlyTechnicalReportsHistory
                    orders={orders}
                    invoices={invoices}
                    technicians={technicians}
                    clients={clients}
                    onSelectOrderForReport={(order) => {
                      setSelectedOrderForReport(order);
                      setActiveTab('tech_report');
                    }}
                    onViewInvoice={(invoiceId) => {}}
                    currentRole={effectiveRole}
                  />
                )}

                {activeTab === 'warehouse' && (
                  <WarehouseInventory
                    spareParts={spareParts}
                    onAddSparePart={handleAddSparePart}
                    onUpdateSparePart={handleUpdateSparePartById}
                    onDeleteSparePart={handleDeleteSparePart}
                    onQuickStockAdjust={handleQuickStockAdjust}
                  />
                )}

                {activeTab === 'suppliers' && (
                  <SuppliersDirectory
                    suppliers={suppliers}
                    onAddSupplier={handleAddSupplier}
                    onUpdateSupplier={handleUpdateSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                  />
                )}

                {activeTab === 'clients' && (
                  <TalentAndClients
                    technicians={technicians}
                    clients={clients}
                    defaultTab="clients"
                    onAddTechnician={handleAddTechnician}
                    onUpdateTechnician={handleUpdateTechnician}
                    onDeleteTechnician={handleDeleteTechnician}
                    onAddClient={handleAddClient}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                  />
                )}

                {(activeTab === 'technicians' || activeTab === 'talent') && (
                  <TalentAndClients
                    technicians={technicians}
                    clients={clients}
                    defaultTab="technicians"
                    onAddTechnician={handleAddTechnician}
                    onUpdateTechnician={handleUpdateTechnician}
                    onDeleteTechnician={handleDeleteTechnician}
                    onAddClient={handleAddClient}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                  />
                )}

                {activeTab === 'tech_report' && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
                    <Wrench className="w-10 h-10 text-sky-600 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Selecciona una Orden de Trabajo Asignada para Diligenciar la Hoja de Reporte
                    </h3>
                    <p className="text-xs text-slate-500">
                      Al tener un servicio asignado, la Hoja de Reporte Técnico queda habilitada para registrar parámetros de presión, voltaje, amperaje, repuestos utilizados y firma del cliente.
                    </p>
                    <div className="space-y-2 text-left pt-2">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => setSelectedOrderForReport(o)}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 cursor-pointer flex justify-between items-center text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 dark:text-white">{o.orderNumber}</strong>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                o.priority === 'EMERGENCIA' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400'
                              }`}>
                                {o.priority}
                              </span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-300 font-medium mt-0.5">{o.clientName}</div>
                            <div className="text-slate-400 text-[11px]">{o.equipmentType}</div>
                          </div>
                          <span className="font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800">
                            Diligenciar Reporte →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'hydraulic_tools' && <HydraulicTools />}
                {activeTab === 'dispatch_map' && (
                  <DispatchMap
                    technicians={technicians}
                    orders={orders}
                    onAssignTechnician={() => {}}
                  />
                )}
                {activeTab === 'predictive_ai' && <AIPredictivePanel />}
              </>
            )}
          </>
        )}

        {/* ======================= CLIENT PORTAL PILLAR ======================= */}
        {effectiveRole === 'client' && (
          <ClientPortal
            client={currentClientAccount}
            orders={orders}
            invoices={invoices}
            spareParts={spareParts}
            onRequestNewOrder={handleCreateServiceRequest}
            onPayInvoice={handleUpdateInvoiceStatus}
          />
        )}
      </main>

      {/* ADMIN PROFILE MODAL */}
      <AdminProfileModal
        isOpen={showAdminProfileModal}
        profile={adminProfile}
        profiles={adminProfiles}
        activeAdminId={
          currentUser?.email.toLowerCase().includes('alejandra')
            ? 'admin-alejandra'
            : 'admin-tatiana'
        }
        onSaveProfile={(updated) => {
          setAdminProfile(updated);
          setAdminProfiles((prev) => {
            const idx = prev.findIndex((p) => p.id === updated.id || p.email.toLowerCase() === updated.email.toLowerCase());
            let next;
            if (idx >= 0) {
              next = [...prev];
              next[idx] = updated;
            } else {
              next = [...prev, updated];
            }
            return next;
          });
          if (currentUser && currentUser.role === 'admin') {
            const isMatchingCurrent =
              currentUser.email.toLowerCase() === updated.email.toLowerCase() ||
              currentUser.username.toLowerCase() === updated.email.toLowerCase();
            if (isMatchingCurrent) {
              const updatedUser: AuthUser = {
                ...currentUser,
                fullName: updated.fullName,
                email: updated.email,
                phone: updated.phone,
                roleTitle: updated.roleTitle,
                avatarUrl: updated.avatarUrl,
              };
              setCurrentUser(updatedUser);
              try {
                localStorage.setItem('ale_auth_session', JSON.stringify(updatedUser));
              } catch {}
            }
          }
        }}
        onClose={() => setShowAdminProfileModal(false)}
      />

      {/* COMPANY SETTINGS MODAL */}
      <CompanySettingsModal
        isOpen={showCompanySettingsModal}
        settings={companySettings}
        onSaveSettings={(updated) => setCompanySettings(updated)}
        onClose={() => setShowCompanySettingsModal(false)}
      />

      {/* SERVICE REQUEST & SPARE PARTS CART MODAL */}
      <ServiceRequestModal
        isOpen={showServiceRequestModal}
        spareParts={spareParts}
        onClose={() => setShowServiceRequestModal(false)}
        onSubmitRequest={handleCreateServiceRequest}
      />

      {/* NOTIFICATION FULL DETAIL MODAL */}
      <NotificationDetailModal
        isOpen={!!selectedNotificationForDetail}
        notification={selectedNotificationForDetail}
        orders={orders}
        onClose={() => setSelectedNotificationForDetail(null)}
        onNavigateToTab={handleNavigateFromNotification}
        onMarkAsRead={handleMarkNotificationAsRead}
        onOpenReportSheet={(order) => {
          setSelectedOrderForReport(order);
          setActiveTab('tech_report');
        }}
      />

      {/* ACCEPT REQUEST MODAL */}
      <AcceptRequestModal
        isOpen={!!selectedOrderToAccept}
        order={selectedOrderToAccept}
        technicians={technicians}
        onClose={() => setSelectedOrderToAccept(null)}
        onConfirmAccept={handleAcceptServiceRequest}
      />

      {/* REJECT REQUEST MODAL */}
      <RejectRequestModal
        isOpen={!!selectedOrderToReject}
        order={selectedOrderToReject}
        onClose={() => setSelectedOrderToReject(null)}
        onConfirmReject={handleRejectServiceRequest}
      />

      {/* Emergency Dispatch Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-500/50 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Despacho de Urgencia Hidráulica 24/7
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Línea Directa: <a href="tel:+573004478151" className="text-rose-500 font-bold hover:underline">300 447 8151</a> • Cuadrilla motorizada Bogotá
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {emergencyCreatedNotice ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  ¡Urgencia Notificada al Ingeniero de Guardia!
                </h4>
                <p className="text-xs text-slate-500">
                  La cuadrilla de ALE. TECNINSTALER está en ruta hacia el conjunto. ETA estimado: 18 minutos.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTriggerEmergencySubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Copropiedad / Conjunto o Empresa Afectada:
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyClient}
                    onChange={(e) => setEmergencyClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Ej: Conjunto Residencial Cerros de Sotavento"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Sistema Hidráulico con Falla:
                  </label>
                  <select
                    value={emergencyEquipType}
                    onChange={(e) => setEmergencyEquipType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Bomba Sumergible Pozo / Aguas Negras">Bomba Sumergible Pozo / Aguas Negras (Inundación)</option>
                    <option value="Sistema de Presión Constante VFD">Sistema de Presión Constante VFD (Sin agua en torres)</option>
                    <option value="Red Contra Incendio (RCI)">Red Contra Incendio (RCI) (Fuga mayor o disparo continuo)</option>
                    <option value="Rotura de Tubería Matriz o Válvula">Rotura de Tubería Matriz o Válvula de Entrada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detalle de la Emergencia en Sitio:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={emergencyIssue}
                    onChange={(e) => setEmergencyIssue(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Describa: ej. Foso de aguas negras rebozado en sótano 2, ambas bombas sumergibles apagadas..."
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-3.5 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg shadow-md shadow-rose-600/30 transition-transform active:scale-95"
                  >
                    Activar Despacho de Urgencia Inmediato
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SHARE CLEAN LINK & RESET HISTORY MODAL */}
      {showShareCleanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-sky-500">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30">
                  <Share2 className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Compartir Enlace Limpio & Privacidad
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Oculta cuentas de acceso rápido y prepara el sistema en 0
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShareCleanModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Feature summary */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>Enlace Seguro para Terceros / Clientes</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Al compartir este enlace especial con el parámetro <code className="px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-900 font-mono text-sky-700 dark:text-sky-300">?shared=true</code>, la pantalla de inicio <strong>ocultará las cuentas de acceso rápido</strong> y cargará el sistema limpio.
                </p>
              </div>

              {/* Share URL input with copy */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enlace para Compartir (Modo Público Limpio):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getCleanShareUrl()}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 text-xs select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyCleanLink}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-600/30 active:scale-95 transition-transform shrink-0"
                  >
                    {copyLinkToast ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Clean History section */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Gestión del Historial de Operaciones:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Reset to 0 button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Desea vaciar todo el historial y dejar el sistema en 0 (cero órdenes, cero facturas y cero movimientos)?')) {
                        handleResetHistoryToZero();
                      }
                    }}
                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-left text-rose-700 dark:text-rose-300 transition-colors space-y-1 group"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Limpiar Historial a CERO (0)</span>
                    </div>
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400">
                      Borra todas las OTs y facturas de prueba registradas.
                    </p>
                  </button>

                  {/* Restore demo dataset button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Desea restablecer los datos de demostración predefinidos?')) {
                        handleRestoreDemoData();
                      }
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left text-slate-700 dark:text-slate-300 transition-colors space-y-1 group"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <RotateCcw className="w-4 h-4 text-sky-500" />
                      <span>Restaurar Datos Demo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Carga el conjunto de prueba con bombas y finanzas.
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowShareCleanModal(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
