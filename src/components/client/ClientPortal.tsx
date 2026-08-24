import React, { useState } from 'react';
import { ClientAccount, WorkOrder, Invoice, TechnicalReport, SparePart, PriorityLevel } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import { ClientSparePartsStore } from './ClientSparePartsStore';
import {
  Building,
  ShieldCheck,
  Clock,
  Wrench,
  AlertTriangle,
  CreditCard,
  BookOpen,
  FileCheck,
  Plus,
  CheckCircle2,
  Phone,
  QrCode,
  Sparkles,
  DollarSign,
  Droplets,
  Calendar,
  Layers,
  Eye,
  Printer,
  Gauge,
  Landmark,
  Smartphone,
  ExternalLink,
  Download,
  FileText,
  ShoppingCart,
  XCircle,
  Shield,
  Settings,
  Package,
  Search,
  GraduationCap,
  UploadCloud,
  Send,
  ArrowRight,
  Info,
  Check,
  User,
  Mail,
  MapPin,
  X,
  Boxes,
} from 'lucide-react';

interface ClientPortalProps {
  client: ClientAccount;
  orders: WorkOrder[];
  invoices: Invoice[];
  spareParts: SparePart[];
  onRequestNewOrder: (newOrder: Partial<WorkOrder>, cartItems?: { part: SparePart; quantity: number }[]) => void;
  onPayInvoice: (invoiceId: string, method: string) => void;
  onOrderSpareParts?: (cartItems: { part: SparePart; quantity: number }[], notes?: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  client,
  orders,
  invoices,
  spareParts,
  onRequestNewOrder,
  onPayInvoice,
  onOrderSpareParts,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'parts' | 'request' | 'payments' | 'knowledge'>('status');
  const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<
    'PSE' | 'NEQUI' | 'DAVIPLATA' | 'BANCOLOMBIA' | 'EFECTIVO' | 'OTROS_BANCOS' | 'TARJETA'
  >('PSE');
  const [pseBank, setPseBank] = useState('Bancolombia');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Inspection modals state for client
  const [selectedReportToView, setSelectedReportToView] = useState<{ report: TechnicalReport; order: WorkOrder } | null>(null);
  const [selectedInvoiceToView, setSelectedInvoiceToView] = useState<Invoice | null>(null);

  // Rich 5-Section Service Request Form State (Identical to Admin Form)
  const [serviceType, setServiceType] = useState<string>('Correctivo');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('Media');
  const [machineryType, setMachineryType] = useState<string>('Sistema de Presión Constante');
  const [specificAccessory, setSpecificAccessory] = useState<string>('Bomba Centrífuga Multietapa Vertical & Tablero VFD');
  const [suggestedDate, setSuggestedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [suggestedTime, setSuggestedTime] = useState<string>('09:00 AM');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [clientContactName, setClientContactName] = useState<string>(client.adminName || '');
  const [clientPhone, setClientPhone] = useState<string>(client.phone || '');
  const [requestCart, setRequestCart] = useState<{ part: SparePart; quantity: number }[]>([]);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Filter orders and invoices for this client
  const clientOrders = orders.filter(
    (o) => o.clientId === client.id || o.clientName.toLowerCase().includes(client.companyName.toLowerCase().slice(0, 8))
  );

  const clientInvoices = invoices.filter(
    (inv) => inv.clientId === client.id || inv.clientName.toLowerCase().includes(client.companyName.toLowerCase().slice(0, 8))
  );

  // Services Catalog
  const serviceOptions = [
    {
      id: 'Correctivo',
      name: 'Correctivo',
      subtitle: 'Reparación de fallas mecánicas, fugas y paros no programados',
      icon: Wrench,
      accent: 'border-rose-500/80 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'Preventivo',
      name: 'Preventivo',
      subtitle: 'Rutinas periódicas, cambio de sellos, rodamientos y lubricación',
      icon: Shield,
      accent: 'border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'Instalacion',
      name: 'Instalación',
      subtitle: 'Montaje de electrobombas, cilindros, tuberías y tableros',
      icon: Settings,
      accent: 'border-sky-500/80 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'Repuesto',
      name: 'Repuesto',
      subtitle: 'Suministro y recambio de repuestos originales',
      icon: Package,
      accent: 'border-purple-500/80 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'Inspeccion',
      name: 'Inspección',
      subtitle: 'Diagnóstico con boroscopia, termografía y pruebas de presión',
      icon: Search,
      accent: 'border-cyan-500/80 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'Sondeo',
      name: 'Sondeo de Tubería',
      subtitle: 'Desobstrucción con hidrojugger y cámaras CCTV de inspección',
      icon: Droplets,
      accent: 'border-blue-500/80 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'Capacitacion',
      name: 'Capacitación',
      subtitle: 'Entrenamiento operativo a conserjes y personal de mantenimiento',
      icon: GraduationCap,
      accent: 'border-amber-500/80 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const urgencyOptions = [
    {
      id: 'Baja',
      title: 'Baja (Programable)',
      desc: 'Mantenimiento preventivo o inspección que puede agendarse en ruta habitual.',
      activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300',
    },
    {
      id: 'Media',
      title: 'Media (Falla Parcial)',
      desc: 'Rendimiento reducido o ruido sin corte total de suministro de agua.',
      activeColor: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
    },
    {
      id: 'Alta',
      title: 'Alta (Emergencia / Paro de Planta)',
      desc: 'Corte total de agua, inundación de foso o disparo de protecciones eléctricas.',
      activeColor: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300',
    },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateUnifiedRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim() && requestCart.length === 0) {
      alert('Por favor ingrese una descripción del requerimiento o seleccione repuestos en la solicitud.');
      return;
    }

    let mappedPriority: PriorityLevel = 'MEDIA';
    if (urgencyLevel === 'Baja') mappedPriority = 'PROGRAMADO';
    else if (urgencyLevel === 'Alta') mappedPriority = 'EMERGENCIA';
    else mappedPriority = 'ALTA';

    const cartTotalCOP = requestCart.reduce((sum, item) => sum + item.part.unitPriceCOP * item.quantity, 0);

    const orderPayload: Partial<WorkOrder> = {
      clientId: client.id,
      clientName: client.companyName,
      clientNit: client.nit,
      clientPhone: clientPhone || client.phone,
      clientContact: clientContactName || client.adminName,
      clientEmail: client.email,
      clientAddress: client.address,
      neighborhood: client.neighborhood,
      city: 'Bogotá D.C.',
      equipmentType: `${machineryType} (${serviceType})`,
      brand: 'Barnes / Pedrollo / Danfoss',
      model: specificAccessory || 'Central Hidráulica',
      priority: mappedPriority,
      reportedIssue: `[${serviceType.toUpperCase()} - Urgencia ${urgencyLevel}] ${problemDescription}${
        requestCart.length > 0
          ? ` | Repuestos requeridos (${requestCart.length}): ` +
            requestCart.map((c) => `${c.quantity}x ${c.part.name}`).join(', ')
          : ''
      }`,
      scheduledDate: suggestedDate,
      scheduledTime: suggestedTime,
      status: 'PENDIENTE',
      requestStatus: 'PENDIENTE',
      totalCostCOP: cartTotalCOP > 0 ? cartTotalCOP : 450000,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      requestedSpareParts: requestCart,
    };

    onRequestNewOrder(orderPayload, requestCart);

    setRequestSubmitted(true);
    setProblemDescription('');
    setPhotoPreviews([]);
    setRequestCart([]);

    setTimeout(() => {
      setRequestSubmitted(false);
      setActiveTab('status');
    }, 2000);
  };

  const handleProcessPayment = () => {
    if (!showPaymentModal) return;
    onPayInvoice(showPaymentModal.id, selectedPaymentGateway);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Client Overview Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <BrandLogo isWatermark className="absolute right-0 top-0 opacity-10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold">
              <Building className="w-3.5 h-3.5" />
              Portal de Autoservicio para Copropiedades
            </div>
            <h1 className="text-2xl font-black">{client.companyName}</h1>
            <p className="text-xs text-slate-300">
              NIT: {client.nit} • {client.address} ({client.neighborhood}) • Admin: <strong>{client.adminName}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab('request')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Solicitud de Servicio
            </button>

            {/* Replaced AI Button with Spare Parts Cart Button */}
            <button
              onClick={() => setActiveTab('parts')}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/40 transition-all flex items-center justify-center gap-2 shadow-md hover:border-purple-400"
            >
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              <span>Carrito de Venta Repuestos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'status'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Estado de Solicitudes & OTs ({clientOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('parts')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'parts'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4 text-purple-500" />
          <span>Galería & Carrito de Repuestos</span>
        </button>

        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'request'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Formato Solicitud de Servicio</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Facturas & Pagos ({clientInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'knowledge'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Normativa RETIE & Fichas</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STATUS OF REQUESTS & WORK ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  Historial de Solicitudes, Órdenes & Dictámenes Técnicos
                </h2>
                <p className="text-xs text-slate-500">
                  Seguimiento en tiempo real de aprobaciones de gerencia, técnicos en camino y reportes oficiales.
                </p>
              </div>
            </div>

            {clientOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay solicitudes ni órdenes de trabajo registradas para esta copropiedad.
              </div>
            ) : (
              <div className="space-y-4">
                {clientOrders.map((order) => {
                  const hasReport = !!order.technicalReport;
                  const isApprovedReport = order.technicalReport?.approvalStatus === 'APROBADO_ENVIADO';
                  const isRejected = order.status === 'RECHAZADA' || order.requestStatus === 'RECHAZADA';
                  const isApprovedRequest = order.requestStatus === 'APROBADA';
                  const isPendingEvaluation = order.status === 'PENDIENTE' || order.requestStatus === 'PENDIENTE';

                  return (
                    <div
                      key={order.id}
                      className={`p-5 rounded-2xl border space-y-3.5 transition-all ${
                        isRejected
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-sm'
                          : isApprovedRequest
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                            {order.orderNumber}
                          </span>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {order.equipmentType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {order.priority}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {isRejected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-rose-600 text-white shadow-md shadow-rose-600/30">
                              <XCircle className="w-3.5 h-3.5" />
                              SOLICITUD RECHAZADA
                            </span>
                          ) : isApprovedRequest ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-emerald-600 text-white shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              SOLICITUD APROBADA
                            </span>
                          ) : isPendingEvaluation ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500 text-white animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              EN EVALUACIÓN POR GERENCIA
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                              {order.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Issue Description */}
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <strong>Requerimiento Reportado:</strong> {order.reportedIssue}
                      </p>

                      {/* Rejection Notification Box */}
                      {isRejected && order.rejectionReason && (
                        <div className="p-4 rounded-2xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-2 animate-fade-in">
                          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Motivo o Justificación de la Decisión Administrativa:</span>
                          </div>
                          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium pl-6 leading-relaxed">
                            "{order.rejectionReason}"
                          </p>
                          {order.rejectedAt && (
                            <div className="text-[10px] text-rose-600/80 dark:text-rose-400 pl-6">
                              Registrado el: {order.rejectedAt}
                            </div>
                          )}

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setProblemDescription(`Reenvío de solicitud previa (${order.orderNumber}) con ajustes requeridos.`);
                                setActiveTab('request');
                              }}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Generar Nueva Solicitud con Ajustes</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Approved Request Details */}
                      {isApprovedRequest && (
                        <div className="p-3 bg-emerald-100/70 dark:bg-emerald-950/50 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Su solicitud fue aprobada. La cuadrilla asignada (<strong>{order.assignedTechnicianName || 'Técnico Especialista'}</strong>) realizará la visita el <strong>{order.scheduledDate}</strong> a las <strong>{order.scheduledTime}</strong>.
                          </span>
                        </div>
                      )}

                      {/* Technical Report Section */}
                      {hasReport && order.technicalReport && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-sky-600" />
                              Ficha Técnica Registrada por {order.technicalReport.technicianName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Lecturas: Descarga {order.technicalReport.dischargePressurePsi} PSI • Amperaje R: {order.technicalReport.ampPhaseR}A • Materiales: {order.technicalReport.materialsUsed.length} repuestos
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedReportToView({ report: order.technicalReport!, order })}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 whitespace-nowrap"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Ficha Técnica Completa
                          </button>
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
                        <span>Técnico Asignado: <strong>{order.assignedTechnicianName || 'Por asignar por Administración'}</strong></span>
                        <span>Programado: {order.scheduledDate} ({order.scheduledTime})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SPARE PARTS GALLERY & CART */}
      {/* ========================================================================= */}
      {activeTab === 'parts' && (
        <ClientSparePartsStore
          client={client}
          spareParts={spareParts}
          onOrderSpareParts={(cartItems, notes) => {
            if (onOrderSpareParts) {
              onOrderSpareParts(cartItems, notes);
            } else {
              // Create standard order with spare parts
              const orderPayload: Partial<WorkOrder> = {
                clientId: client.id,
                clientName: client.companyName,
                clientNit: client.nit,
                clientPhone: client.phone,
                clientContact: client.adminName,
                clientAddress: client.address,
                neighborhood: client.neighborhood,
                equipmentType: 'Pedido Directo de Repuestos & Suministros',
                priority: 'MEDIA',
                reportedIssue: `Pedido de Repuestos (${cartItems.length} ítems): ` +
                  cartItems.map((c) => `${c.quantity}x ${c.part.name} [SKU: ${c.part.code}]`).join(', ') +
                  (notes ? ` | Notas de entrega: ${notes}` : ''),
                totalCostCOP: cartItems.reduce((acc, c) => acc + c.part.unitPriceCOP * c.quantity, 0),
                status: 'PENDIENTE',
                requestStatus: 'PENDIENTE',
                scheduledDate: new Date().toISOString().split('T')[0],
                scheduledTime: 'Despacho en Bodega',
              };
              onRequestNewOrder(orderPayload, cartItems);
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UNIFIED SERVICE REQUEST FORM (IDENTICAL TO ADMIN FORM) */}
      {/* ========================================================================= */}
      {activeTab === 'request' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-sky-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Formato de Solicitud de Servicio Técnico & Repuestos
                </h2>
                <p className="text-xs text-slate-500">
                  ALE. TECNINSTALER S.A.S. • Despacho de Cuadrillas & Asignación de Ingenieros
                </p>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {requestSubmitted && (
            <div className="p-4 bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 animate-fade-in shadow-md">
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Solicitud de servicio enviada con éxito! Ha sido remitida a la Gerencia de Operaciones para su aprobación.</span>
            </div>
          )}

          {/* Main Form Content */}
          <form onSubmit={handleCreateUnifiedRequest} className="p-6 sm:p-8 space-y-8 text-xs">
            {/* SECTION 1: Service Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Selecciona el Tipo de Servicio Requerido:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {serviceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = serviceType === opt.name;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setServiceType(opt.name)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 shadow-md ring-2 ring-sky-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl border ${opt.accent}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 font-black" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{opt.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {opt.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Urgency Level */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Nivel de Urgencia Operativa:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {urgencyOptions.map((urg) => {
                  const isSelected = urgencyLevel === urg.id;
                  return (
                    <button
                      key={urg.id}
                      type="button"
                      onClick={() => setUrgencyLevel(urg.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? `${urg.activeColor} shadow-md ring-2 ring-offset-1`
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{urg.title}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                      <p className="text-[11px] opacity-80 mt-1">{urg.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Machinery & Problem Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
                <span>Maquinaria & Detalle de la Solicitud:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Sistema / Maquinaria:
                  </label>
                  <select
                    value={machineryType}
                    onChange={(e) => setMachineryType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Baños">Baños (Sanitarios, Griferías, Válvulas, Fluxómetros)</option>
                    <option value="Cocinas">Cocinas (Lavaplatos, Griferías, Sifones, Trampas de Grasa)</option>
                    <option value="Duchas">Duchas (Mezcladores, Regaderas, Teleduchas, Cartuchos)</option>
                    <option value="Jacuzzis">Jacuzzis & Spas (Hidromasajes, Bombas, Blowers, Calentadores)</option>
                    <option value="Sondeo">Sondeo & Desobstrucción (Tuberías, Cajas, Hidrojet, Sifones)</option>
                    <option value="Sistema de Presión Constante">Sistema de Presión Constante (VFD / Multietapa)</option>
                    <option value="Equipo Hidroneumático Tradicional">Equipo Hidroneumático Tradicional (Pulmón/Membrana)</option>
                    <option value="Bomba Sumergible de Aguas Negras / Lluvias">Bomba Sumergible de Aguas Negras / Lluvias</option>
                    <option value="Sistema Contra Incendio (RCI)">Sistema Contra Incendio (RCI - NFPA 20)</option>
                    <option value="Lavado y Desinfección de Tanques">Lavado y Desinfección de Tanques (Decreto 1575)</option>
                    <option value="Tablero de Control y Automatización">Tablero de Control y Automatización</option>
                    <option value="Otros">Otros (Sistemas Hidráulicos Generales & Especiales)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Accesorio o Equipo Específico:
                  </label>
                  <input
                    type="text"
                    value={specificAccessory}
                    onChange={(e) => setSpecificAccessory(e.target.value)}
                    placeholder="Ej. Bomba #2, Manómetro glicerina, Flotador pozo..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>Fecha Sugerida de Visita:</span>
                  </label>
                  <input
                    type="date"
                    value={suggestedDate}
                    onChange={(e) => setSuggestedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>Horario Sugerido:</span>
                  </label>
                  <select
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="08:00 AM">08:00 AM (Primera franja mañana)</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM (Tarde)</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="Inmediata 24/7">Inmediata 24/7 (Emergencia)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Detallada del Problema o Requerimiento:
                </label>
                <textarea
                  rows={3}
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describa síntomas (ruidos, presiones bajas, fugas de agua, disparo térmico, olor a quemado)..."
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Photo Evidence Upload */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adjuntar Fotos / Evidencias (Placa de motor, fuga, manómetro):
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-sky-400 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-2 hover:bg-sky-100 transition-colors">
                    <UploadCloud className="w-4 h-4" />
                    <span>Subir Imágenes</span>
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {photoPreviews.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: Contact & Copropiedad Data (Prefilled) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">4</span>
                <span>Datos de la Copropiedad & Persona de Contacto:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">Copropiedad / Razón Social:</label>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-sky-600" />
                    <span>{client.companyName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">NIT: {client.nit}</div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">Persona que Autoriza en Sitio:</label>
                  <input
                    type="text"
                    value={clientContactName}
                    onChange={(e) => setClientContactName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">Celular / Teléfono de Contacto:</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Info className="w-4 h-4 text-sky-500 shrink-0" />
                <span>
                  Al enviar, la Gerencia Técnica revisará la solicitud para confirmar la cuadrilla de ingenieros y el horario.
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Radicar Solicitud a Gerencia Técnica</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CLIENT INVOICES AND COMPLETE PAYMENT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Facturación Electrónica DIAN & Pasarela de Pagos
              </h2>
              <p className="text-xs text-slate-500">
                Consulta tus facturas oficiales generadas a partir de los reportes técnicos y paga en línea con PSE o Nequi.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {clientInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No hay facturas registradas para esta copropiedad.</p>
            ) : (
              clientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm hover:shadow-md transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-sm">
                        {inv.invoiceNumber}
                      </span>
                      {inv.orderNumber && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {inv.orderNumber}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inv.paymentStatus === 'PAGADO'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300'
                        }`}
                      >
                        {inv.paymentStatus === 'PAGADO' ? 'PAGADA & CONCILIADA' : 'PENDIENTE DE PAGO'}
                      </span>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                      {inv.items[0]?.description} {inv.items.length > 1 && `(+${inv.items.length - 1} conceptos adicionales)`}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Emisión: <strong>{inv.issueDate}</strong></span>
                      <span>Vencimiento: <strong>{inv.dueDate}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Liquidado:</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCOP(inv.totalCOP)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceToView(inv)}
                        className="p-2.5 text-slate-500 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                        title="Ver detalle de factura electrónica"
                      >
                        <FileText className="w-5 h-5" />
                      </button>

                      {inv.paymentStatus !== 'PAGADO' && (
                        <button
                          onClick={() => setShowPaymentModal(inv)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pagar con PSE / Nequi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RETIE NORMATIVE & TECHNICAL KNOWLEDGE */}
      {/* ========================================================================= */}
      {activeTab === 'knowledge' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Biblioteca Técnica & Normatividad para Copropiedades
              </h2>
              <p className="text-xs text-slate-500">
                Leyes, decretos colombianos y protocolos de mantenimiento para cuartos de bombas residenciales y comerciales.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px]">
                Decreto 1575 de 2007
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">Lavado y Desinfección Semestral de Tanques</h3>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Establece la obligatoriedad de realizar mantenimiento, lavado y desinfección preventiva cada 6 meses en tanques de almacenamiento de agua potable en propiedad horizontal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                Reglamento RETIE
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">Seguridad en Tableros Eléctricos y Guardamotores</h3>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Norma técnica para verificación de aislamiento térmico, calibración de relés de sobrecarga y puesta a tierra en arrancadores de electrobombas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Pasarela de Pago Electrónico</span>
              </div>
              <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">¡Pago Conciliado con Éxito!</h3>
                <p className="text-slate-500">Se ha emitido el comprobante digital DIAN.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-400 text-[10px]">Factura a cancelar:</div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{showPaymentModal.invoiceNumber}</div>
                  <div className="text-base font-black text-emerald-600 font-mono mt-1">{formatCOP(showPaymentModal.totalCOP)}</div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Seleccione medio de pago:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentGateway('PSE')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPaymentGateway === 'PSE'
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold ring-1 ring-sky-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">PSE</div>
                      <div className="text-[10px] text-slate-500">Débito en Línea</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentGateway('BANCOLOMBIA')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPaymentGateway === 'BANCOLOMBIA'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Bancolombia</div>
                      <div className="text-[10px] text-slate-500">Transferencia / QR</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentGateway('NEQUI')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPaymentGateway === 'NEQUI'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold ring-1 ring-purple-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Nequi</div>
                      <div className="text-[10px] text-slate-500">314 285 9934</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentGateway('DAVIPLATA')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPaymentGateway === 'DAVIPLATA'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold ring-1 ring-rose-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Daviplata</div>
                      <div className="text-[10px] text-slate-500">310 554 1290</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentGateway('EFECTIVO')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPaymentGateway === 'EFECTIVO'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Efectivo</div>
                      <div className="text-[10px] text-slate-500">Recibo en Sitio</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentGateway('OTROS_BANCOS')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPaymentGateway === 'OTROS_BANCOS'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Otros Bancos</div>
                      <div className="text-[10px] text-slate-500">ACH Colombia</div>
                    </button>
                  </div>
                </div>

                {(selectedPaymentGateway === 'PSE' || selectedPaymentGateway === 'OTROS_BANCOS') && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Entidad Bancaria Emisora (Colombia):
                    </label>
                    <select
                      value={pseBank}
                      onChange={(e) => setPseBank(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="Bancolombia">Bancolombia S.A.</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Davivienda">Banco Davivienda</option>
                      <option value="BBVA Colombia">BBVA Colombia</option>
                      <option value="Banco de Occidente">Banco de Occidente</option>
                      <option value="Banco Popular">Banco Popular</option>
                      <option value="Banco AV Villas">Banco AV Villas</option>
                      <option value="Banco Itaú">Banco Itaú Colombia</option>
                      <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                      <option value="Banco Caja Social">Banco Caja Social</option>
                      <option value="Banco Agrario">Banco Agrario de Colombia</option>
                      <option value="Nu Colombia (Cuenta Nu)">Nu Colombia (Cuenta Nu)</option>
                      <option value="Lulo Bank">Lulo Bank</option>
                      <option value="Ualá Colombia">Ualá Colombia</option>
                      <option value="RappiPay (Davipay)">RappiPay Compañía de Financiamiento</option>
                      <option value="Banco Falabella">Banco Falabella</option>
                      <option value="Banco Pichincha">Banco Pichincha</option>
                      <option value="Bancoomeva">Bancoomeva</option>
                      <option value="Finandina">Banco Finandina</option>
                      <option value="Coopcentral">Banco Cooperativo Coopcentral</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={handleProcessPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
                >
                  Confirmar y Transferir {formatCOP(showPaymentModal.totalCOP)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Report View Modal */}
      {selectedReportToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <FileCheck className="w-5 h-5 text-sky-600" />
                <span>Ficha Técnica Oficial — {selectedReportToView.order.orderNumber}</span>
              </div>
              <button onClick={() => setSelectedReportToView(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{selectedReportToView.report.equipmentType}</div>
                <div className="text-slate-500">{selectedReportToView.report.brand} • Serial: {selectedReportToView.report.serialNumber}</div>
                <div className="text-slate-500">Técnico responsable: <strong>{selectedReportToView.report.technicianName} ({selectedReportToView.report.technicianDocument})</strong></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <div className="text-[10px] text-sky-600">Presión Descarga</div>
                  <div className="font-mono font-black text-sm text-sky-900 dark:text-sky-200">{selectedReportToView.report.dischargePressurePsi} PSI</div>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <div className="text-[10px] text-sky-600">Amperaje R</div>
                  <div className="font-mono font-black text-sm text-sky-900 dark:text-sky-200">{selectedReportToView.report.ampPhaseR} A</div>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <div className="text-[10px] text-sky-600">Aislamiento</div>
                  <div className="font-mono font-black text-sm text-sky-900 dark:text-sky-200">{selectedReportToView.report.insulationResistanceMohm} MΩ</div>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <div className="text-[10px] text-sky-600">Vibración Axial</div>
                  <div className="font-mono font-black text-sm text-sky-900 dark:text-sky-200">{selectedReportToView.report.vibrationMmS} mm/s</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Trabajo Ejecutado:</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedReportToView.report.workPerformed}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recomendaciones:</span>
                <p className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 leading-relaxed">
                  {selectedReportToView.report.recommendations}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedReportToView(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
