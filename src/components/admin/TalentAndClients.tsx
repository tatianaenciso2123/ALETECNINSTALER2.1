import React, { useState, useEffect, useRef } from 'react';
import { Technician, ClientAccount, InstalledEquipment, UserRole } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import {
  Users,
  Building,
  Award,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Wrench,
  DollarSign,
  FileCheck,
  Edit2,
  Trash2,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  MapPin,
  FileText,
  Lock,
  X,
  Camera,
  RefreshCw,
  Sparkles,
  Shield,
  Briefcase,
} from 'lucide-react';

interface TalentAndClientsProps {
  technicians: Technician[];
  clients: ClientAccount[];
  defaultTab?: 'technicians' | 'clients';
  currentRole?: UserRole;
  onAddTechnician: (tech: Technician) => void;
  onUpdateTechnician: (tech: Technician) => void;
  onDeleteTechnician: (techId: string) => void;
  onAddClient: (client: ClientAccount) => void;
  onUpdateClient: (client: ClientAccount) => void;
  onDeleteClient: (clientId: string) => void;
}

// Preset photo options for quick avatar selection
const PRESET_TECH_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

const PRESET_CLIENT_AVATARS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
];

export const TalentAndClients: React.FC<TalentAndClientsProps> = ({
  technicians,
  clients,
  defaultTab = 'technicians',
  currentRole = 'admin',
  onAddTechnician,
  onUpdateTechnician,
  onDeleteTechnician,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [activeTab, setActiveTab] = useState<'technicians' | 'clients'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(clients[0] || null);

  // Password / sensitive admin data visibility states
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [showClientPassword, setShowClientPassword] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Modals state
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [editingClient, setEditingClient] = useState<ClientAccount | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'tech' | 'client'; id: string; name: string } | null>(null);

  // Form states - Employee
  const [techForm, setTechForm] = useState({
    fullName: '',
    documentType: 'Cédula de Ciudadanía' as 'Cédula de Ciudadanía' | 'Cédula de Extranjería' | 'Pasaporte' | 'PEP' | 'NIT',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    jobPosition: 'Técnico Especialista en Bombas y VFD',
    educationLevel: 'Técnico Laboral / SENA',
    specialty: 'Electrobombas y VFD' as Technician['specialty'],
    conteLicense: '',
    baseSalaryCOP: 3000000,
    overtimeBonusCOP: 200000,
    username: '',
    password: '',
    avatarUrl: PRESET_TECH_AVATARS[0],
  });

  // Form states - Client
  const [clientForm, setClientForm] = useState({
    companyName: '',
    documentType: 'NIT' as 'NIT' | 'Cédula de Ciudadanía' | 'Cédula de Extranjería' | 'Pasaporte',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    clientRole: 'Administrador de Copropiedad',
    adminName: '',
    neighborhood: 'Usaquén',
    city: 'Bogotá D.C.',
    contractType: 'PREVENTIVO_GOLD_MENSUAL' as ClientAccount['contractType'],
    housingType: 'Conjunto Residencial Cerrado',
    housingDescription: '',
    username: '',
    password: '',
    avatarUrl: PRESET_CLIENT_AVATARS[0],
  });

  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const filteredTechnicians = technicians.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Create Employee Modal
  const handleOpenCreateTech = () => {
    setEditingTech(null);
    setTechForm({
      fullName: '',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '',
      phone: '',
      email: '',
      address: '',
      jobPosition: 'Técnico Especialista en Bombas y VFD',
      educationLevel: 'Técnico Laboral / SENA',
      specialty: 'Electrobombas y VFD',
      conteLicense: `TE-${Math.floor(100000 + Math.random() * 900000)} (CONTE)`,
      baseSalaryCOP: 3000000,
      overtimeBonusCOP: 250000,
      username: '',
      password: `emp${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: PRESET_TECH_AVATARS[Math.floor(Math.random() * PRESET_TECH_AVATARS.length)],
    });
    setShowPassword(false);
    setIsTechModalOpen(true);
  };

  // Open Edit Employee Modal
  const handleOpenEditTech = (tech: Technician) => {
    setEditingTech(tech);
    setTechForm({
      fullName: tech.fullName,
      documentType: tech.documentType || 'Cédula de Ciudadanía',
      documentNumber: tech.documentNumber || tech.documentId.replace(/[^0-9.]/g, '').trim(),
      phone: tech.phone,
      email: tech.email,
      address: tech.address || 'Calle 100 # 15-20, Bogotá',
      jobPosition: tech.jobPosition || 'Técnico Especialista en Bombas y VFD',
      educationLevel: tech.educationLevel || 'Técnico Laboral / SENA',
      specialty: tech.specialty,
      conteLicense: tech.conteLicense,
      baseSalaryCOP: tech.baseSalaryCOP,
      overtimeBonusCOP: tech.overtimeBonusCOP,
      username: tech.username || tech.email,
      password: tech.password || 'empleado123',
      avatarUrl: tech.avatarUrl || PRESET_TECH_AVATARS[0],
    });
    setShowPassword(false);
    setIsTechModalOpen(true);
  };

  // Save Employee
  const handleSaveTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techForm.fullName.trim() || !techForm.documentNumber.trim() || !techForm.username.trim() || !techForm.password.trim()) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    const docPrefix = techForm.documentType === 'Cédula de Ciudadanía' ? 'CC' : techForm.documentType === 'NIT' ? 'NIT' : techForm.documentType;
    const documentId = `${docPrefix} ${techForm.documentNumber.trim()}`;

    if (editingTech) {
      const updated: Technician = {
        ...editingTech,
        fullName: techForm.fullName.trim(),
        documentType: techForm.documentType,
        documentNumber: techForm.documentNumber.trim(),
        documentId: documentId,
        phone: techForm.phone.trim(),
        email: techForm.email.trim(),
        address: techForm.address.trim(),
        jobPosition: techForm.jobPosition,
        educationLevel: techForm.educationLevel,
        specialty: techForm.specialty,
        conteLicense: techForm.conteLicense.trim(),
        baseSalaryCOP: Number(techForm.baseSalaryCOP) || 3000000,
        overtimeBonusCOP: Number(techForm.overtimeBonusCOP) || 0,
        username: techForm.username.trim().toLowerCase(),
        password: techForm.password.trim(),
        avatarUrl: techForm.avatarUrl,
      };
      onUpdateTechnician(updated);
    } else {
      const newTech: Technician = {
        id: `tech-${Date.now()}`,
        fullName: techForm.fullName.trim(),
        documentType: techForm.documentType,
        documentNumber: techForm.documentNumber.trim(),
        documentId: documentId,
        phone: techForm.phone.trim(),
        email: techForm.email.trim(),
        address: techForm.address.trim(),
        jobPosition: techForm.jobPosition,
        educationLevel: techForm.educationLevel,
        specialty: techForm.specialty,
        conteLicense: techForm.conteLicense.trim() || `TE-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'DISPONIBLE',
        currentLocationName: 'Base Operativa - Calle 80 # 69',
        coordinates: { lat: 4.6855, lng: -74.0841 },
        baseSalaryCOP: Number(techForm.baseSalaryCOP) || 3000000,
        overtimeBonusCOP: Number(techForm.overtimeBonusCOP) || 0,
        completedOrdersCount: 0,
        ratingScore: 5.0,
        certifications: ['Trabajo Seguro en Alturas', 'Espacios Confinados', 'Norma NFPA 20'],
        username: techForm.username.trim().toLowerCase(),
        password: techForm.password.trim(),
        avatarUrl: techForm.avatarUrl,
      };
      onAddTechnician(newTech);
    }

    setIsTechModalOpen(false);
  };

  // Open Create Client Modal
  const handleOpenCreateClient = () => {
    setEditingClient(null);
    setClientForm({
      companyName: '',
      documentType: 'NIT',
      documentNumber: '',
      phone: '',
      email: '',
      address: '',
      clientRole: 'Administrador de Copropiedad',
      adminName: '',
      neighborhood: 'Usaquén',
      city: 'Bogotá D.C.',
      contractType: 'PREVENTIVO_GOLD_MENSUAL',
      housingType: 'Conjunto Residencial Cerrado',
      housingDescription: '',
      username: '',
      password: `cli${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: PRESET_CLIENT_AVATARS[Math.floor(Math.random() * PRESET_CLIENT_AVATARS.length)],
    });
    setShowPassword(false);
    setIsClientModalOpen(true);
  };

  // Open Edit Client Modal
  const handleOpenEditClient = (client: ClientAccount) => {
    setEditingClient(client);
    setClientForm({
      companyName: client.companyName,
      documentType: client.documentType || 'NIT',
      documentNumber: client.documentNumber || client.nit,
      phone: client.phone,
      email: client.email,
      address: client.address,
      clientRole: client.clientRole || 'Administrador de Copropiedad',
      adminName: client.adminName,
      neighborhood: client.neighborhood || 'Usaquén',
      city: client.city || 'Bogotá D.C.',
      contractType: client.contractType,
      housingType: client.housingType || 'Conjunto Residencial Cerrado',
      housingDescription: client.housingDescription || '',
      username: client.username || client.email,
      password: client.password || 'cliente123',
      avatarUrl: client.avatarUrl || PRESET_CLIENT_AVATARS[0],
    });
    setShowPassword(false);
    setIsClientModalOpen(true);
  };

  // Save Client
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.companyName.trim() || !clientForm.documentNumber.trim() || !clientForm.username.trim() || !clientForm.password.trim()) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    if (editingClient) {
      const updated: ClientAccount = {
        ...editingClient,
        companyName: clientForm.companyName.trim(),
        documentType: clientForm.documentType,
        documentNumber: clientForm.documentNumber.trim(),
        nit: clientForm.documentNumber.trim(),
        adminName: clientForm.adminName.trim() || clientForm.companyName.trim(),
        clientRole: clientForm.clientRole,
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        address: clientForm.address.trim(),
        neighborhood: clientForm.neighborhood.trim(),
        city: clientForm.city.trim(),
        contractType: clientForm.contractType,
        housingType: clientForm.housingType,
        housingDescription: clientForm.housingDescription.trim(),
        username: clientForm.username.trim().toLowerCase(),
        password: clientForm.password.trim(),
        avatarUrl: clientForm.avatarUrl,
      };
      onUpdateClient(updated);
      if (selectedClient?.id === updated.id) {
        setSelectedClient(updated);
      }
    } else {
      const newClient: ClientAccount = {
        id: `cli-${Date.now()}`,
        companyName: clientForm.companyName.trim(),
        documentType: clientForm.documentType,
        documentNumber: clientForm.documentNumber.trim(),
        nit: clientForm.documentNumber.trim(),
        adminName: clientForm.adminName.trim() || 'Administración de Copropiedad',
        clientRole: clientForm.clientRole,
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        address: clientForm.address.trim(),
        neighborhood: clientForm.neighborhood.trim() || 'Sector Residencial',
        city: clientForm.city.trim() || 'Bogotá D.C.',
        contractType: clientForm.contractType,
        housingType: clientForm.housingType,
        housingDescription: clientForm.housingDescription.trim(),
        sanitaryCertificateValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        username: clientForm.username.trim().toLowerCase(),
        password: clientForm.password.trim(),
        avatarUrl: clientForm.avatarUrl,
        equipments: [
          {
            id: `eq-${Date.now()}`,
            type: 'Sistema Hidroneumático Presión Constante',
            brand: 'Barnes de Colombia',
            model: '3HE 3x3 10HP Trifásica',
            hp: 10,
            serial: `BAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            locationInBuilding: 'Cuarto de Bombas Principal Sótano',
            installDate: new Date().toISOString().split('T')[0],
            lastMaintenanceDate: new Date().toISOString().split('T')[0],
            nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            operatingHours: 120,
            riskScore: 15,
            riskLevel: 'NORMAL',
          },
        ],
      };
      onAddClient(newClient);
      setSelectedClient(newClient);
    }

    setIsClientModalOpen(false);
  };

  // Image File Upload Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isTech: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        if (isTech) {
          setTechForm((prev) => ({ ...prev, avatarUrl: resultUrl }));
        } else {
          setClientForm((prev) => ({ ...prev, avatarUrl: resultUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'tech') {
      onDeleteTechnician(itemToDelete.id);
    } else {
      onDeleteClient(itemToDelete.id);
      if (selectedClient?.id === itemToDelete.id) {
        setSelectedClient(clients.find((c) => c.id !== itemToDelete.id) || null);
      }
    }
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel Exclusivo de Administración
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            Gestión Integral de Empleados & Directorio de Clientes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administre, agregue, edite y elimine datos, fotos y credenciales de acceso para todo el personal y clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('technicians')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'technicians'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-500" />
              <span>Empleados ({technicians.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-sky-500" />
              <span>Clientes ({clients.length})</span>
            </button>
          </div>

          {activeTab === 'technicians' ? (
            <button
              onClick={handleOpenCreateTech}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Empleado</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateClient}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-900/30 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'technicians'
                ? 'Buscar por nombre, usuario, cédula, teléfono o especialidad...'
                : 'Buscar por razón social, NIT, usuario, administrador o dirección...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Mostrando {activeTab === 'technicians' ? filteredTechnicians.length : filteredClients.length} registros
        </div>
      </div>

      {/* ================= TAB 1: EMPLEADOS / TÉCNICOS ================= */}
      {activeTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Profile Header with Photo & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {tech.avatarUrl ? (
                        <img
                          src={tech.avatarUrl}
                          alt={tech.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                          {tech.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Activo" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {tech.fullName}
                      </h3>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                        {tech.specialty}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {tech.documentType || 'CC'}: {tech.documentNumber || tech.documentId}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) - Only for Admin */}
                  {currentRole === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTech(tech)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                        title="Editar empleado y credenciales"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete({ type: 'tech', id: tech.id, name: tech.fullName })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact & Professional Info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-500" /> Teléfono:
                    </span>
                    <span className="font-bold">{tech.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-sky-500" /> Correo:
                    </span>
                    <span className="font-medium truncate max-w-[150px]">{tech.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-rose-500" /> Dirección:
                    </span>
                    <span className="font-medium truncate max-w-[150px]">{tech.address || 'Bogotá D.C.'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-amber-500" /> Matrícula:
                    </span>
                    <span className="font-mono font-bold">{tech.conteLicense}</span>
                  </div>
                </div>

                {/* Platform Access Credentials Card - ONLY VISIBLE TO ADMINISTRATORS */}
                {currentRole === 'admin' ? (
                  <div className="p-3 rounded-xl bg-slate-900 text-white border border-sky-500/30 space-y-1.5 text-xs shadow-inner">
                    <div className="flex items-center justify-between text-[10px] pb-1 border-b border-slate-800">
                      <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-sky-400">
                        <ShieldCheck className="w-3 h-3 text-sky-400" />
                        Acceso Asignado (Solo Admin)
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(tech.id)}
                        className="text-[10px] text-slate-400 hover:text-sky-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                        title={revealedPasswords[tech.id] ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {revealedPasswords[tech.id] ? (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-sky-400" />
                            <span>Revelar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Usuario:</span>
                      <span className="font-mono font-bold text-sky-300">{tech.username || tech.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Contraseña:</span>
                      <span className="font-mono text-slate-200">
                        {revealedPasswords[tech.id] ? tech.password || '••••••••' : '••••••••'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Personal Técnico Operativo Certificado y Habilitado</span>
                  </div>
                )}
              </div>

              {/* Footer / Salary Summary or Availability */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {currentRole === 'admin' ? (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Salario + Bonos:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCOP(tech.baseSalaryCOP + tech.overtimeBonusCOP)} / mes
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Estado Operativo:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Disponible
                    </span>
                  </div>
                )}
                <a
                  href={`tel:${tech.phone}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-500" />
                  Llamar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 2: CLIENTES & COPROPIEDADES ================= */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Client List (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Directorio de Clientes Contratados
              </h3>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-bold">
                {filteredClients.length} Clientes
              </span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-sm ring-1 ring-sky-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt={client.companyName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-sky-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {client.companyName}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditClient(client);
                              }}
                              className="p-1 text-slate-400 hover:text-sky-600"
                              title="Editar cliente"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete({ type: 'client', id: client.id, name: client.companyName });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{client.documentType || 'NIT'}: {client.documentNumber || client.nit}</span>
                          <span>•</span>
                          <span className="text-sky-600 font-semibold">{client.clientRole || 'Cliente'}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                          <span className="text-slate-400 truncate max-w-[140px]">📍 {client.address}</span>
                          <span className="font-bold text-slate-900 dark:text-white shrink-0">
                            {formatCOP(client.monthlyFeeCOP)} / mes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Details & Credentials & Life Sheet (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {selectedClient ? (
              <div className="space-y-5">
                {/* Client header with Photo and Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    {selectedClient.avatarUrl ? (
                      <img
                        src={selectedClient.avatarUrl}
                        alt={selectedClient.companyName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-md shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-sky-700 text-white font-black text-2xl flex items-center justify-center shrink-0">
                        {selectedClient.companyName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedClient.companyName}
                      </h2>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {selectedClient.documentType || 'NIT'}: <strong>{selectedClient.documentNumber || selectedClient.nit}</strong> • Contacto: {selectedClient.adminName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        📍 {selectedClient.address}, {selectedClient.city}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditClient(selectedClient)}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-sky-200 dark:border-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar Cliente
                    </button>
                    <button
                      onClick={() => setItemToDelete({ type: 'client', id: selectedClient.id, name: selectedClient.companyName })}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* 3-Column Info Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono & Correo</span>
                    <div className="font-bold text-slate-900 dark:text-white truncate">{selectedClient.phone}</div>
                    <div className="text-slate-500 truncate">{selectedClient.email}</div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Rol Asignado</span>
                    <div className="font-bold text-sky-600 dark:text-sky-400">{selectedClient.clientRole || 'Cliente'}</div>
                    <div className="text-slate-500">{selectedClient.contractType?.replace('_', ' ')}</div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cuota Mensual</span>
                    <div className="font-black text-slate-900 dark:text-white text-sm">{formatCOP(selectedClient.monthlyFeeCOP)}</div>
                    <div className="text-emerald-600 font-semibold text-[10px]">Contrato Activo</div>
                  </div>
                </div>

                {/* Assigned Login Credentials - ONLY VISIBLE TO ADMINISTRATORS */}
                {currentRole === 'admin' && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white border border-sky-500/30 space-y-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                        Credenciales de Acceso al Portal (Solo Administrador)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      >
                        {showClientPassword ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-sky-400" />}
                        <span>{showClientPassword ? 'Ocultar' : 'Revelar'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Usuario / Correo:</span>
                        <strong className="text-sky-300 font-mono">{selectedClient.username || selectedClient.email}</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Contraseña Asignada:</span>
                        <strong className="text-slate-200 font-mono">
                          {showClientPassword ? selectedClient.password || 'cliente123' : '••••••••'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Installed Equipments Sheet */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-sky-600" />
                    Equipos Hidráulicos Instalados ({selectedClient.equipments.length})
                  </h3>

                  <div className="space-y-3">
                    {selectedClient.equipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {eq.type}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              eq.riskLevel === 'CRÍTICO'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                : eq.riskLevel === 'MODERADO'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}
                          >
                            Riesgo: {eq.riskLevel} ({eq.riskScore}%)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                          <div>
                            <span className="text-slate-400 block">Marca / Modelo:</span>
                            <strong>{eq.brand} {eq.model}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Potencia / Serie:</span>
                            <strong>{eq.hp} HP | {eq.serial}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Horas Operación:</span>
                            <strong>{eq.operatingHours.toLocaleString()} hrs</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Próx. Mantenimiento:</span>
                            <strong className="text-sky-600">{formatDate(eq.nextMaintenanceDate)}</strong>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          📍 Ubicación física: {eq.locationInBuilding}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Seleccione un cliente para consultar sus datos y equipos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: AGREGAR / EDITAR EMPLEADO ================= */}
      {isTechModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingTech ? 'Editar Datos del Empleado' : 'Registrar Nuevo Empleado'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asigne información personal, foto y credenciales de acceso.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTechModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTech} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Photo Upload & Preview Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Foto de Perfil del Empleado
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {techForm.avatarUrl ? (
                    <img
                      src={techForm.avatarUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, true)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Subir Foto desde Archivo
                      </button>
                    </div>

                    {/* Presets Selection */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">O elija un avatar predeterminado:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_TECH_AVATARS.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Avatar ${idx}`}
                            onClick={() => setTechForm((prev) => ({ ...prev, avatarUrl: url }))}
                            className={`w-7 h-7 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                              techForm.avatarUrl === url ? 'border-emerald-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information (Required Fields) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={techForm.fullName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTechForm((prev) => ({
                        ...prev,
                        fullName: val,
                        // auto suggest username if empty
                        username: prev.username || val.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') + '@alestecninstaler.com',
                      }));
                    }}
                    placeholder="Ej. Ing. Carlos Andrés Restrepo"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tipo de Identificación <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={techForm.documentType}
                    onChange={(e: any) => setTechForm((prev) => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cédula de Ciudadanía">Cédula de Ciudadanía (CC)</option>
                    <option value="Cédula de Extranjería">Cédula de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                    <option value="NIT">NIT Personal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Número de Identificación <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={techForm.documentNumber}
                    onChange={(e) => setTechForm((prev) => ({ ...prev, documentNumber: e.target.value }))}
                    placeholder="Ej. 1.020.485.932"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Teléfono Celular <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={techForm.phone}
                    onChange={(e) => setTechForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ej. +57 312 458 9012"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={techForm.email}
                    onChange={(e) => setTechForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Ej. carlos.restrepo@alestecninstaler.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dirección Residencial / Operativa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={techForm.address}
                    onChange={(e) => setTechForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Ej. Calle 140 # 11-30, Barrio Cedritos, Bogotá"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cargo en la Empresa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={techForm.jobPosition}
                    onChange={(e: any) => setTechForm((prev) => ({ ...prev, jobPosition: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Técnico Especialista en Bombas y VFD">Técnico Especialista en Bombas y VFD</option>
                    <option value="Ingeniero de Operaciones Hidráulicas">Ingeniero de Operaciones Hidráulicas</option>
                    <option value="Técnico Electricista & Tableros CONTE">Técnico Electricista & Tableros CONTE</option>
                    <option value="Técnico Mecánico de Sistemas Hidroneumáticos">Técnico Mecánico de Sistemas Hidroneumáticos</option>
                    <option value="Inspector de Redes Contra Incendio RCI">Inspector de Redes Contra Incendio RCI</option>
                    <option value="Supervisor de Cuadrilla & Mantenimiento">Supervisor de Cuadrilla & Mantenimiento</option>
                    <option value="Auxiliar Técnico de Mantenimiento">Auxiliar Técnico de Mantenimiento</option>
                    <option value="Auditor de Calidad y Decreto 1575">Auditor de Calidad y Decreto 1575</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nivel de Escolaridad / Formación <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={techForm.educationLevel}
                    onChange={(e: any) => setTechForm((prev) => ({ ...prev, educationLevel: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Técnico Laboral / SENA">Técnico Laboral / SENA</option>
                    <option value="Tecnólogo en Electromecánica">Tecnólogo en Electromecánica</option>
                    <option value="Profesional Universitario / Ingeniería">Profesional Universitario / Ingeniería</option>
                    <option value="Especialización / Posgrado">Especialización / Posgrado</option>
                    <option value="Bachiller Técnico">Bachiller Técnico</option>
                    <option value="Certificación Internacional NFPA/CONTE">Certificación Internacional NFPA/CONTE</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Especialidad Técnica <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={techForm.specialty}
                    onChange={(e: any) => setTechForm((prev) => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Electrobombas y VFD">Electrobombas y VFD</option>
                    <option value="Redes RCI & Contra Incendio">Redes RCI & Contra Incendio</option>
                    <option value="Plantas Tratamiento & Osmosis">Plantas Tratamiento & Osmosis</option>
                    <option value="Hidroneumáticos & Válvulas">Hidroneumáticos & Válvulas</option>
                    <option value="General Hidráulico">General Hidráulico</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Matrícula Profesional CONTE / COPNIA
                  </label>
                  <input
                    type="text"
                    value={techForm.conteLicense}
                    onChange={(e) => setTechForm((prev) => ({ ...prev, conteLicense: e.target.value }))}
                    placeholder="Ej. TE-048591 (CONTE)"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Login Credentials Assigned by Admin */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Credenciales de Ingreso para el Empleado
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-bold border border-emerald-800">
                    Rol: Empleado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300 font-semibold">
                      Usuario de Ingreso <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={techForm.username}
                      onChange={(e) => setTechForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="usuario@alestecninstaler.com"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-sky-300 font-mono focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300 font-semibold">
                      Contraseña de Acceso <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={techForm.password}
                        onChange={(e) => setTechForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Contraseña segura"
                        className="w-full pl-3 pr-8 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTechModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTech ? 'Actualizar Empleado' : 'Guardar Empleado'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AGREGAR / EDITAR CLIENTE ================= */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-600 text-white">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingClient ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asigne información de la copropiedad/empresa, foto/logo y credenciales de acceso.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Photo / Logo Upload & Preview Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Foto de la Fachada o Logo del Cliente
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {clientForm.avatarUrl ? (
                    <img
                      src={clientForm.avatarUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Building className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, false)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Subir Foto / Logo
                      </button>
                    </div>

                    {/* Presets Selection */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">O elija una fachada predeterminada:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_CLIENT_AVATARS.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Client Avatar ${idx}`}
                            onClick={() => setClientForm((prev) => ({ ...prev, avatarUrl: url }))}
                            className={`w-7 h-7 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                              clientForm.avatarUrl === url ? 'border-sky-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information (Required Fields) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nombre / Razón Social o Copropiedad <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.companyName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClientForm((prev) => ({
                        ...prev,
                        companyName: val,
                        username: prev.username || val.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') + '@cliente.com',
                      }));
                    }}
                    placeholder="Ej. Conjunto Residencial Cerros de Sotavento"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tipo de Identificación <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={clientForm.documentType}
                    onChange={(e: any) => setClientForm((prev) => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="NIT">NIT (Número de Identificación Tributaria)</option>
                    <option value="Cédula de Ciudadanía">Cédula de Ciudadanía (CC)</option>
                    <option value="Cédula de Extranjería">Cédula de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Número de Identificación <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.documentNumber}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, documentNumber: e.target.value }))}
                    placeholder="Ej. 900.548.120-1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Teléfono de Contacto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ej. +57 310 554 9921"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Ej. administracion@cerrosdesotavento.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dirección Física <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.address}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Ej. Calle 134 # 9-45, Usaquén, Bogotá"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Rol de Cliente (Requerido solo para Clientes) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rol del Cliente <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={clientForm.clientRole}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, clientRole: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Administrador de Copropiedad">Administrador de Copropiedad</option>
                    <option value="Propietario / Residente">Propietario / Residente</option>
                    <option value="Gerente de Mantenimiento">Gerente de Mantenimiento</option>
                    <option value="Consejo de Administración">Consejo de Administración</option>
                    <option value="Director de Operaciones Planta">Director de Operaciones Planta</option>
                    <option value="Cliente Comercial / Corporativo">Cliente Comercial / Corporativo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nombre del Administrador / Contacto
                  </label>
                  <input
                    type="text"
                    value={clientForm.adminName}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, adminName: e.target.value }))}
                    placeholder="Ej. Dra. Martha Patricia Gómez"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tipo de Contrato
                  </label>
                  <select
                    value={clientForm.contractType}
                    onChange={(e: any) => setClientForm((prev) => ({ ...prev, contractType: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PREVENTIVO_GOLD_MENSUAL">Preventivo Gold (Mensual)</option>
                    <option value="PREVENTIVO_SILVER_BIMENSUAL">Preventivo Silver (Bimensual)</option>
                    <option value="POR_EVENTO">Por Evento / Emergencia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tipo de Inmueble / Vivienda <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={clientForm.housingType}
                    onChange={(e: any) => setClientForm((prev) => ({ ...prev, housingType: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Conjunto Residencial Cerrado">Conjunto Residencial Cerrado</option>
                    <option value="Edificio Residencial / PH">Edificio Residencial / PH</option>
                    <option value="Casa Unifamiliar / Condominio">Casa Unifamiliar / Condominio</option>
                    <option value="Centro Comercial / Empresarial">Centro Comercial / Empresarial</option>
                    <option value="Parque Industrial / Bodega">Parque Industrial / Bodega</option>
                    <option value="Clínica / Hospital / Laboratorio">Clínica / Hospital / Laboratorio</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Descripción Específica de Vivienda <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={clientForm.housingDescription}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, housingDescription: e.target.value }))}
                    placeholder="Ej. Torre 2 Apto 804, Manzana C Casa 15"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Login Credentials Assigned by Admin */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Credenciales de Ingreso para el Cliente
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded font-bold border border-amber-800">
                    Rol: Cliente
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300 font-semibold">
                      Usuario de Ingreso <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.username}
                      onChange={(e) => setClientForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="administracion@copropiedad.com"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300 font-semibold">
                      Contraseña de Acceso <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={clientForm.password}
                        onChange={(e) => setClientForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Contraseña segura"
                        className="w-full pl-3 pr-8 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-900/30 transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingClient ? 'Actualizar Cliente' : 'Guardar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAR ELIMINACIÓN ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Eliminar {itemToDelete.type === 'tech' ? 'Empleado' : 'Cliente'}?
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ¿Está seguro de eliminar a <strong>{itemToDelete.name}</strong>? Se revocarán sus credenciales de acceso a la plataforma. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-transform active:scale-95"
              >
                Sí, Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
