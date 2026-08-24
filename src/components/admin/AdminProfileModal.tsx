import React, { useState, useEffect } from 'react';
import { AdminProfile } from '../../types';
import { User, Mail, Phone, ShieldCheck, Camera, Check, X, Building, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: AdminProfile;
  profiles?: AdminProfile[];
  activeAdminId?: string;
  onSaveProfile: (updated: AdminProfile) => void;
  onSelectActiveAdmin?: (adminId: string) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  profiles = [],
  activeAdminId,
  onSaveProfile,
  onSelectActiveAdmin,
}) => {
  // Default list of 2 default admins if not provided
  const adminList: AdminProfile[] = profiles.length > 0 ? profiles : [
    {
      id: 'admin-tatiana',
      fullName: 'Tatiana Enciso',
      email: 'tatianaenciso2123@gmail.com',
      phone: '+57 300 447 8151',
      roleTitle: 'Gerente General & Administradora del Sistema',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      signatureUrl: '',
      department: 'Dirección General & Auditoría Técnica',
    },
    {
      id: 'admin-alejandra',
      fullName: 'Alejandra Cruz',
      email: 'alejandra.cruz@alestecninstaler.com',
      phone: '+57 315 789 4432',
      roleTitle: 'Directora de Operaciones & Administradora Técnica',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      signatureUrl: '',
      department: 'Dirección Técnica & Operaciones Hidráulicas',
    },
  ];

  const [selectedAdminId, setSelectedAdminId] = useState<string>(() => {
    if (activeAdminId) return activeAdminId;
    if (profile?.id) return profile.id;
    return adminList[0].id;
  });

  const currentAdmin = adminList.find((a) => a.id === selectedAdminId) || profile || adminList[0];
  const [formData, setFormData] = useState<AdminProfile>({ ...currentAdmin });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const match = adminList.find((a) => a.id === selectedAdminId) || profile || adminList[0];
      setFormData({ ...match });
    }
  }, [isOpen, selectedAdminId, profile]);

  if (!isOpen) return null;

  const handleAdminSwitch = (adminId: string) => {
    setSelectedAdminId(adminId);
    const target = adminList.find((a) => a.id === adminId);
    if (target) {
      setFormData({ ...target });
      if (onSelectActiveAdmin) {
        onSelectActiveAdmin(adminId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span>Perfiles de Administración del Sistema</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  2 Administradores Predeterminados
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solo Tatiana Enciso y Alejandra Cruz tienen permisos totales para modificar datos en la aplicación.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Seleccionar Administradora para Ver / Editar:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {adminList.map((admin) => {
              const isSelected = selectedAdminId === admin.id || formData.email.toLowerCase() === admin.email.toLowerCase();
              return (
                <button
                  key={admin.id}
                  type="button"
                  onClick={() => handleAdminSwitch(admin.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/40 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <img
                    src={admin.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
                    alt={admin.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-sky-400/50 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {admin.fullName}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-sky-600 dark:text-sky-400 font-medium truncate">
                      {admin.roleTitle}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                      {admin.email}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security & Access Banner */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <strong className="block font-bold">Permisos Totales de Modificación Habilitados</strong>
            Esta cuenta cuenta con facultades exclusivas para crear, actualizar, facturar y eliminar datos en todos los módulos del sistema.
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Perfil de {formData.fullName} actualizado y guardado correctamente!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="relative group">
              <img
                src={formData.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
                alt="Avatar Admin"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500 shadow-md"
              />
              <label
                htmlFor="admin-avatar-upload"
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                title="Subir foto de perfil"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Cambiar</span>
              </label>
              <input
                id="admin-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Foto de Perfil & Avatar ({formData.fullName})
              </div>
              <p className="text-[11px] text-slate-500">
                Selecciona una foto predefinida o sube una imagen institucional.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {presetAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                    className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                      formData.avatarUrl === url ? 'border-sky-500 scale-105 ring-2 ring-sky-400/40' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-500" />
                Nombre Completo de la Administradora:
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Ej: Tatiana Enciso"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                Cargo / Rol Profesional:
              </label>
              <input
                type="text"
                required
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Ej: Gerente General & Administradora"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-500" />
                Correo Institucional de Acceso:
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                placeholder="tatianaenciso2123@gmail.com"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-500" />
                Teléfono / WhatsApp Directo:
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="+57 300 447 8151"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-500" />
                Área o Departamento:
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Dirección General & Auditoría Técnica"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              * Cambios guardados para <span className="font-bold text-slate-800 dark:text-slate-200">{formData.fullName}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-600/30 active:scale-95 transition-transform flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar Perfil de {formData.fullName.split(' ')[0]}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

