import React, { useState } from 'react';
import { WorkOrder, TechnicalReport, MaterialItem, SparePart } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import { SignatureCanvas } from '../common/SignatureCanvas';
import { INVENTORY_SPARE_PARTS } from '../../data/mockData';
import {
  FileText,
  Gauge,
  Zap,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Printer,
  Save,
  ShieldCheck,
  QrCode,
  ArrowLeft,
  RotateCcw,
  X,
  User,
  Building,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Info,
} from 'lucide-react';

interface DigitalReportSheetProps {
  order: WorkOrder;
  onSaveReport: (orderId: string, report: TechnicalReport) => void;
  onBack: () => void;
  spareParts?: SparePart[];
}

export const DigitalReportSheet: React.FC<DigitalReportSheetProps> = ({
  order,
  onSaveReport,
  onBack,
  spareParts = INVENTORY_SPARE_PARTS,
}) => {
  const existingReport = order.technicalReport;

  // 1. Datos del Empleado / Técnico que realiza la visita
  const [technicianName, setTechnicianName] = useState(
    existingReport?.technicianName || order.assignedTechnicianName || 'Ing. Carlos Andrés Restrepo'
  );
  const [technicianDocument, setTechnicianDocument] = useState(
    existingReport?.technicianDocument || 'CC 1.020.485.932 - TE-048591 (CONTE)'
  );
  const [technicianSpecialty, setTechnicianSpecialty] = useState(
    'Técnico Especialista en Equipos de Presión y Bombeo Hidráulico'
  );
  const [visitDate, setVisitDate] = useState(
    existingReport?.date || order.scheduledDate || new Date().toISOString().split('T')[0]
  );
  const [visitTime, setVisitTime] = useState(order.scheduledTime || '09:00 AM');

  // Datos del Equipo Hidráulico
  const [equipmentType, setEquipmentType] = useState(existingReport?.equipmentType || order.equipmentType);
  const [brand, setBrand] = useState(existingReport?.brand || order.brand);
  const [model, setModel] = useState(existingReport?.model || order.model);
  const [hpPower, setHpPower] = useState(existingReport?.hpPower || order.hpPower || 10);
  const [serialNumber, setSerialNumber] = useState(existingReport?.serialNumber || 'BAR-2022-9014');
  const [voltagePhase, setVoltagePhase] = useState<'Trifásico 220V' | 'Trifásico 440V' | 'Monofásico 220V' | 'Monofásico 110V'>(
    existingReport?.voltagePhase || 'Trifásico 220V'
  );

  // 2. Diagnóstico de Hallazgos y Mediciones Técnicas en Operación
  const [suctionPressurePsi, setSuctionPressurePsi] = useState<number>(existingReport?.suctionPressurePsi ?? 4);
  const [dischargePressurePsi, setDischargePressurePsi] = useState<number>(existingReport?.dischargePressurePsi ?? 68);
  const [ampPhaseR, setAmpPhaseR] = useState<number>(existingReport?.ampPhaseR ?? 29.8);
  const [ampPhaseS, setAmpPhaseS] = useState<number>(existingReport?.ampPhaseS ?? 30.1);
  const [ampPhaseT, setAmpPhaseT] = useState<number>(existingReport?.ampPhaseT ?? 31.4);
  const [nominalAmperage, setNominalAmperage] = useState<number>(existingReport?.nominalAmperage ?? 26.5);
  const [insulationResistanceMohm, setInsulationResistanceMohm] = useState<number>(existingReport?.insulationResistanceMohm ?? 85);
  const [vibrationMmS, setVibrationMmS] = useState<number>(existingReport?.vibrationMmS ?? 6.8);

  const [stateBefore, setStateBefore] = useState<'CRÍTICO' | 'REGULAR' | 'BUENO'>(
    existingReport?.generalStateBefore || 'CRÍTICO'
  );
  const [stateAfter, setStateAfter] = useState<'ÓPTIMO' | 'BUENO' | 'OBSERVACIÓN'>(
    existingReport?.generalStateAfter || 'ÓPTIMO'
  );

  const [diagnosticDetails, setDiagnosticDetails] = useState(
    existingReport?.diagnosticDetails ||
      (order.reportedIssue
        ? `Hallazgos técnicos: ${order.reportedIssue}. Se evidencia desgaste mecánico y desbalance de presión en el cabezal.`
        : 'Desgaste severo en pistas de rodamiento y sello mecánico por cavitación leve y sobrecorriente.')
  );

  // 3. Detalle del Trabajo Realizado y Recomendaciones
  const [workPerformed, setWorkPerformed] = useState(
    existingReport?.workPerformed ||
      'Desmontaje de cabezal, cambio de rodamientos SKF Explorer C3, instalación de sello mecánico de carburo de silicio, alineación láser y pruebas de presión estática/dinámica.'
  );
  const [recommendations, setRecommendations] = useState(
    existingReport?.recommendations ||
      'Verificar rampa de aceleración en variador de frecuencia (VFD) y realizar chequeo de vibración en 15 días.'
  );

  // 4. Repuestos Instalados y Costo de la Visita
  const [laborCostCOP, setLaborCostCOP] = useState<number>(180000);
  const [materials, setMaterials] = useState<MaterialItem[]>(
    existingReport?.materialsUsed || [
      {
        id: 'm-1',
        name: 'Sello Mecánico 1 1/4" Carburo de Silicio',
        code: 'SM-CARB-125',
        quantity: 1,
        unit: 'UND',
        unitPriceCOP: 280000,
        totalCOP: 280000,
      },
      {
        id: 'm-2',
        name: 'Juego Rodamientos SKF Explorer 6308-2Z C3',
        code: 'ROD-SKF-6308',
        quantity: 2,
        unit: 'JGO',
        unitPriceCOP: 165000,
        totalCOP: 330000,
      },
    ]
  );

  const [selectedInventoryPartId, setSelectedInventoryPartId] = useState(
    spareParts[0]?.id || INVENTORY_SPARE_PARTS[0].id
  );

  // 5. Firma Digital de Conformidad
  const [clientSignerName, setClientSignerName] = useState(existingReport?.clientNameSigner || order.clientContact);
  const [clientSignerDoc, setClientSignerDoc] = useState(existingReport?.clientDocumentSigner || 'CC 52.890.114');
  const [clientSignerRole, setClientSignerRole] = useState(existingReport?.clientRoleSigner || 'Administrador / Encargado');
  const [clientSignatureUrl, setClientSignatureUrl] = useState(existingReport?.clientSignatureDataUrl || '');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddMaterial = () => {
    const part = spareParts.find((p) => p.id === selectedInventoryPartId);
    if (!part) return;

    const newItem: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: part.name,
      code: part.code,
      quantity: 1,
      unit: part.unit || 'UND',
      unitPriceCOP: part.unitPriceCOP,
      totalCOP: part.unitPriceCOP,
    };

    setMaterials([...materials, newItem]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  // Botón LIMPIAR: resetea campos de reporte y borra la firma
  const handleClearForm = () => {
    setDiagnosticDetails('');
    setWorkPerformed('');
    setRecommendations('');
    setMaterials([]);
    setLaborCostCOP(0);
    setSuctionPressurePsi(0);
    setDischargePressurePsi(0);
    setAmpPhaseR(0);
    setAmpPhaseS(0);
    setAmpPhaseT(0);
    setVibrationMmS(0);
    setClientSignatureUrl('');
    setShowClearConfirm(false);
  };

  // Botón GUARDAR & CERTIFICAR
  const handleSave = () => {
    const report: TechnicalReport = {
      id: existingReport?.id || `rep-${Date.now()}`,
      orderId: order.id,
      date: visitDate,
      technicianName,
      technicianDocument,
      equipmentType,
      brand,
      model,
      hpPower,
      serialNumber,
      voltagePhase,
      suctionPressurePsi,
      dischargePressurePsi,
      ampPhaseR,
      ampPhaseS,
      ampPhaseT,
      nominalAmperage,
      insulationResistanceMohm,
      vibrationMmS,
      generalStateBefore: stateBefore,
      generalStateAfter: stateAfter,
      materialsUsed: materials,
      diagnosticDetails,
      workPerformed,
      recommendations,
      clientNameSigner: clientSignerName,
      clientDocumentSigner: clientSignerDoc,
      clientRoleSigner: clientSignerRole,
      clientSignatureDataUrl: clientSignatureUrl,
      approvalStatus: 'PENDIENTE_VALIDACION',
      photoEvidenceUrls: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      ],
    };

    onSaveReport(order.id, report);
    setIsSavedSuccessfully(true);
    setTimeout(() => setIsSavedSuccessfully(false), 5000);
  };

  const totalMaterialsCostCOP = materials.reduce((acc, m) => acc + m.totalCOP, 0);
  const grandTotalCostCOP = totalMaterialsCostCOP + (laborCostCOP || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-full">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors shrink-0 mt-0.5 sm:mt-0"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Hoja de Reporte Digital & Acta Técnica
              </h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white shrink-0">
                OT: {order.orderNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Cliente: <strong className="text-slate-700 dark:text-slate-300">{order.clientName}</strong> • {order.clientAddress}
            </p>
          </div>
        </div>

        {/* 3 Main Action Buttons: Limpiar, Cancelar, Guardar & Certificar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Botón Limpiar */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </button>

          {/* Botón Cancelar */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            Cancelar
          </button>

          {/* Botón Guardar & Certificar */}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 transition-transform active:scale-95 flex-1 sm:flex-initial justify-center"
          >
            <Save className="w-4 h-4" />
            Guardar & Certificar
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Limpiar */}
      {showClearConfirm && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs space-y-2">
          <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            ¿Deseas limpiar todos los campos editados del reporte y borrar la firma?
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleClearForm}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
            >
              Sí, Limpiar Formulario
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isSavedSuccessfully && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-black">¡Ficha Técnica Guardada y Certificada!</div>
            <div className="text-[11px] font-normal opacity-90">
              Se ha guardado el diagnóstico, detalle de trabajo, repuestos y firma digital. La orden ha sido actualizada y se notificó a Administración.
            </div>
          </div>
        </div>
      )}

      {/* Main Printable / Form Card with Corporate Frame */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Corporate Watermark */}
        <BrandLogo isWatermark className="absolute inset-0 m-auto" />

        {/* Corporate Header */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <BrandLogo size="md" showText={true} textVariant="full" theme="dark" />
          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div className="font-bold text-slate-900 dark:text-white">NIT: 901.458.720-3 • ALE. TECNINSTALER S.A.S.</div>
            <div>PBX: (601) 745-9000 • Sede Bogotá D.C.</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Sistema Hydraulic Precision v3.4</div>
          </div>
        </div>

        {/* 1. SECCIÓN: DATOS DEL CLIENTE */}
        <div className="relative z-10 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Building className="w-4 h-4" />
            1. Datos del Cliente & Copropiedad
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-0.5">Copropiedad / Razón Social:</label>
              <div className="font-black text-slate-900 dark:text-white text-sm">{order.clientName}</div>
              <div className="text-[11px] text-slate-500">NIT: {order.clientNit || '901.458.720-3'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-0.5">Ubicación & Dirección:</label>
              <div className="font-bold text-slate-900 dark:text-white">{order.clientAddress}</div>
              <div className="text-[11px] text-slate-500">Barrio: {order.neighborhood}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-0.5">Contacto / Administrador:</label>
              <div className="font-bold text-slate-900 dark:text-white">{order.clientContact}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-500" />
                {order.clientPhone}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-0.5">Tipo de Servicio & OT:</label>
              <div className="font-mono font-black text-slate-900 dark:text-white">{order.orderNumber}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{order.type} • {order.priority}</div>
            </div>
          </div>
        </div>

        {/* 2. SECCIÓN: DATOS DEL EMPLEADO QUE REALIZA LA VISITA */}
        <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            2. Datos del Empleado / Técnico que Realiza la Visita
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nombre del Técnico:</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cédula & Matrícula CONTE:</label>
              <input
                type="text"
                value={technicianDocument}
                onChange={(e) => setTechnicianDocument(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Fecha & Hora de Visita:</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <input
                  type="text"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-24 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. SECCIÓN: DATOS DEL EQUIPO HIDRÁULICO */}
        <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            3. Datos del Equipo Hidráulico Inspeccionado
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-500 font-semibold">Tipo de Equipo / Área:</label>
                <div className="flex items-center gap-1">
                  {['Baños', 'Cocinas', 'Duchas', 'Jacuzzis', 'Sondeo', 'Otros'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEquipmentType(opt)}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                        equipmentType.toLowerCase().includes(opt.toLowerCase())
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                placeholder="Ej: Baños, Cocinas, Duchas, Jacuzzis, Sondeo..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Marca y Modelo:</label>
              <input
                type="text"
                value={`${brand} ${model}`}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* 4. SECCIÓN: DIAGNÓSTICO DE HALLAZGOS Y CAUSA RAÍZ */}
        <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            4. Diagnóstico de Hallazgos & Causa Raíz Encontrada
          </h3>

          {/* Campo editable de Diagnóstico de Hallazgos */}
          <div>
            <textarea
              rows={3}
              value={diagnosticDetails}
              onChange={(e) => setDiagnosticDetails(e.target.value)}
              placeholder="Describa los hallazgos técnicos detectados durante la inspección inicial..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* 5. SECCIÓN: DETALLE DEL TRABAJO REALIZADO */}
        <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <h3 className="font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            5. Detalle del Trabajo Realizado & Recomendaciones
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detalle de Trabajos Realizados, Calibraciones y Pruebas:
              </label>
              <textarea
                rows={3}
                value={workPerformed}
                onChange={(e) => setWorkPerformed(e.target.value)}
                placeholder="Describa los trabajos ejecutados paso a paso..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recomendaciones Técnicas para la Copropiedad:
              </label>
              <textarea
                rows={3}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Recomendaciones operativas y de mantenimiento preventivo..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 6. SECCIÓN: REPUESTOS INSTALADOS / COSTO DE LA VISITA */}
        <div className="relative z-10 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              6. Repuestos Instalados & Costo de la Visita Técnica
            </h3>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedInventoryPartId}
                onChange={(e) => setSelectedInventoryPartId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs flex-1 sm:max-w-xs min-w-0"
              >
                {spareParts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCOP(p.unitPriceCOP)}) - Stock: {p.stock}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddMaterial}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto w-full max-w-full">
            <table className="w-full text-left min-w-[500px] sm:min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Descripción Repuesto</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">V. Unitario</th>
                  <th className="py-2 px-3 text-right">Total COP</th>
                  <th className="py-2 px-3 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">
                      No se registraron repuestos instalados para esta visita.
                    </td>
                  </tr>
                ) : (
                  materials.map((mat) => (
                    <tr key={mat.id}>
                      <td className="py-2 px-3 font-mono text-slate-500">{mat.code}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">{mat.name}</td>
                      <td className="py-2 px-3 text-center">{mat.quantity} {mat.unit}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{formatCOP(mat.unitPriceCOP)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCOP(mat.totalCOP)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveMaterial(mat.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Eliminar repuesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desglose de Costos de la Visita */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mano de Obra / Tarifa de Visita (COP):</label>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                  <input
                    type="number"
                    step="10000"
                    value={laborCostCOP}
                    onChange={(e) => setLaborCostCOP(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
                <span className="text-slate-500 text-xs block">Subtotal Repuestos:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {formatCOP(totalMaterialsCostCOP)}
                </span>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
                <span className="text-emerald-700 dark:text-emerald-400 font-black text-xs block uppercase tracking-wider">
                  Costo Total de la Visita:
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                  {formatCOP(grandTotalCostCOP)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. SECCIÓN: FIRMA DIGITAL DE CONFORMIDAD */}
        <div className="relative z-10 space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            7. Firma Digital de Conformidad del Cliente (Receptor Autorizado)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nombre del Firmante:</label>
              <input
                type="text"
                value={clientSignerName}
                onChange={(e) => setClientSignerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cédula / Documento:</label>
              <input
                type="text"
                value={clientSignerDoc}
                onChange={(e) => setClientSignerDoc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cargo en la Copropiedad:</label>
              <input
                type="text"
                value={clientSignerRole}
                onChange={(e) => setClientSignerRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Interactive Touch/Mouse Signature Canvas */}
          <SignatureCanvas
            title="Estampe de Firma Digital Táctil del Cliente"
            signerName={clientSignerName}
            initialSignature={clientSignatureUrl}
            onSaveSignature={(dataUrl) => setClientSignatureUrl(dataUrl)}
          />
        </div>

        {/* Official Footer with QR code & Legal validation */}
        <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300">
              ALE. TECNINSTALER S.A.S. • Registro de Mantenimiento Hidráulico Certificado
            </div>
            <div>
              Documento con validez legal según Ley 527 de 1999 sobre firmas y comercio electrónico en Colombia.
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" />
            <div className="text-[9px] font-mono">
              VERIFICAR ACTA<br />
              COD: TI-2026-{order.orderNumber}
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons Bar */}
        <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar Formato
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-rose-500" />
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              Guardar & Certificar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

