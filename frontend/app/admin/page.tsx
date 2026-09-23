'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  api,
  Appointment,
  Service,
  WorkingHours,
  Blocker,
  ScheduleOverride,
} from '@/lib/api';
import {
  Calendar,
  Clock,
  User,
  LogOut,
  XCircle,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Bell,
  Settings,
  Scissors,
  Slash,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agenda' | 'services' | 'hours' | 'blockers'>('agenda');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Agenda states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForceModal, setShowForceModal] = useState(false);

  // Force Appt Form
  const [forceServiceId, setForceServiceId] = useState('');
  const [forceDate, setForceDate] = useState(new Date().toISOString().split('T')[0]);
  const [forceStart, setForceStart] = useState('10:00');
  const [forceClientName, setForceClientName] = useState('');
  const [forceClientPhone, setForceClientPhone] = useState('');
  const [forceClientNickname, setForceClientNickname] = useState('');
  const [submittingForce, setSubmittingForce] = useState(false);

  // Services states
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Hours states
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [savingHours, setSavingHours] = useState(false);

  // Blockers and overrides states
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [newBlockerDate, setNewBlockerDate] = useState('');
  const [newBlockerStart, setNewBlockerStart] = useState('');
  const [newBlockerEnd, setNewBlockerEnd] = useState('');
  const [newBlockerReason, setNewBlockerReason] = useState('');

  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideEnabled, setNewOverrideEnabled] = useState(true);
  const [newOverrideStart, setNewOverrideStart] = useState('10:00');
  const [newOverrideEnd, setNewOverrideEnd] = useState('20:00');
  const [newOverrideReason, setNewOverrideReason] = useState('');

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        await api.getMe();
        await loadAllData();
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndLoad();
  }, [router]);

  const loadAllData = async () => {
    try {
      const [appts, svcs, wh, bls, ovs] = await Promise.all([
        api.getAppointments(),
        api.getServices(true),
        api.getWorkingHours().catch(() => null),
        api.getBlockers().catch(() => []),
        api.getScheduleOverrides().catch(() => []),
      ]);
      setAppointments(appts);
      setServices(svcs);
      if (svcs.length > 0) setForceServiceId(svcs[0].id);
      if (wh) setWorkingHours(wh);
      setBlockers(bls);
      setOverrides(ovs);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los datos del panel.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // --- AGENDA ACTIONS ---
  const handleAdminCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta cita como administrador?')) return;
    try {
      await api.cancelAppointmentByAdmin(id);
      setSuccessMsg('Cita cancelada.');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cancelar la cita.');
    }
  };

  const handleConfirmAppointment = async (id: string) => {
    try {
      await api.confirmAppointment(id);
      setSuccessMsg('Cita confirmada.');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, confirmado: true } : a))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al confirmar la cita.');
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      const res = await api.sendReminder(id);
      if (res.sent || res.ok) {
        setSuccessMsg('Recordatorio enviado por WhatsApp.');
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, recordatorio_enviado: true } : a))
        );
      } else {
        setErrorMsg(res.error || 'No se pudo enviar el recordatorio.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar recordatorio.');
    }
  };

  const handleForceAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forceServiceId || !forceDate || !forceStart || !forceClientName || !forceClientPhone) return;

    setSubmittingForce(true);
    setErrorMsg('');
    try {
      const newAppt = await api.forceAppointment({
        service_id: forceServiceId,
        date: forceDate,
        start: forceStart,
        client_name: forceClientName.trim(),
        client_phone: forceClientPhone.trim(),
        client_nickname: forceClientNickname.trim() || undefined,
      });
      setAppointments((prev) => [...prev, newAppt]);
      setSuccessMsg('Cita agendada manualmente (forzada) con éxito.');
      setShowForceModal(false);
      setForceClientName('');
      setForceClientPhone('');
      setForceClientNickname('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al agendar cita.');
    } finally {
      setSubmittingForce(false);
    }
  };

  // --- SERVICES ACTIONS ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;

    try {
      if (editingService.id) {
        const updated = await api.updateService(editingService.id, editingService);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setSuccessMsg('Servicio actualizado.');
      } else {
        const created = await api.createService({
          name: editingService.name,
          description: editingService.description || '',
          price_eur: Number(editingService.price_eur) || 0,
          duration_min: Number(editingService.duration_min) || 30,
          active: editingService.active ?? true,
        });
        setServices((prev) => [...prev, created]);
        setSuccessMsg('Servicio creado.');
      }
      setEditingService(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el servicio.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await api.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setSuccessMsg('Servicio eliminado.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar servicio.');
    }
  };

  // --- HOURS ACTIONS ---
  const handleSaveWorkingHours = async () => {
    if (!workingHours) return;
    setSavingHours(true);
    try {
      await api.setWorkingHours(workingHours.days);
      await api.setLunchBreak(workingHours.lunch);
      setSuccessMsg('Horarios guardados correctamente.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar horarios.');
    } finally {
      setSavingHours(false);
    }
  };

  // --- BLOCKERS & OVERRIDES ACTIONS ---
  const handleAddBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockerDate) return;
    try {
      const added = await api.addBlocker({
        date: newBlockerDate,
        start: newBlockerStart || null,
        end: newBlockerEnd || null,
        reason: newBlockerReason.trim(),
      });
      setBlockers((prev) => [...prev, added]);
      setSuccessMsg('Bloqueo añadido.');
      setNewBlockerDate('');
      setNewBlockerStart('');
      setNewBlockerEnd('');
      setNewBlockerReason('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al añadir bloqueo.');
    }
  };

  const handleDeleteBlocker = async (id: string) => {
    try {
      await api.deleteBlocker(id);
      setBlockers((prev) => prev.filter((b) => b.id !== id));
      setSuccessMsg('Bloqueo eliminado.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar bloqueo.');
    }
  };

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOverrideDate) return;
    try {
      const added = await api.upsertScheduleOverride({
        date: newOverrideDate,
        enabled: newOverrideEnabled,
        start: newOverrideStart,
        end: newOverrideEnd,
        reason: newOverrideReason.trim(),
      });
      setOverrides((prev) => [
        ...prev.filter((o) => o.date !== added.date),
        added,
      ]);
      setSuccessMsg('Excepción guardada.');
      setNewOverrideDate('');
      setNewOverrideReason('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar excepción.');
    }
  };

  const handleDeleteOverride = async (date: string) => {
    try {
      await api.deleteScheduleOverride(date);
      setOverrides((prev) => prev.filter((o) => o.date !== date));
      setSuccessMsg('Excepción eliminada.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar excepción.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex items-center justify-center">
        <p className="text-zinc-500 font-serif text-lg animate-pulse">Cargando panel de administración...</p>
      </div>
    );
  }

  const filteredAppointments = appointments.filter((a) => a.date === filterDate);

  const dayNames: Record<string, string> = {
    '0': 'Lunes',
    '1': 'Martes',
    '2': 'Miércoles',
    '3': 'Jueves',
    '4': 'Viernes',
    '5': 'Sábado',
    '6': 'Domingo',
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] text-zinc-900 pb-20">
      {/* Header Admin */}
      <header className="bg-[#38312d] text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl tracking-tight">
              ML Mimo Mento Nails Studio<span className="text-[#c57d62]">.</span>
            </span>
            <span className="text-xs bg-[#c57d62] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wider flex items-center gap-1.5 text-zinc-300 hover:text-white transition"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-6">
        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-xs font-bold">X</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-xs font-bold">X</button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex border-b border-zinc-300 mb-8 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`py-3 px-6 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'agenda'
                ? 'border-[#c57d62] text-[#c57d62] bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Calendar className="size-4" /> Agenda & Citas
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-6 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'services'
                ? 'border-[#c57d62] text-[#c57d62] bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Scissors className="size-4" /> Servicios
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`py-3 px-6 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'hours'
                ? 'border-[#c57d62] text-[#c57d62] bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Clock className="size-4" /> Horarios Base
          </button>
          <button
            onClick={() => setActiveTab('blockers')}
            className={`py-3 px-6 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'blockers'
                ? 'border-[#c57d62] text-[#c57d62] bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Slash className="size-4" /> Bloqueos y Excepciones
          </button>
        </div>

        {/* TAB 1: AGENDA */}
        {activeTab === 'agenda' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-600">
                  Ver Fecha:
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="p-2 border border-zinc-300 bg-white font-medium text-sm"
                />
              </div>

              <button
                onClick={() => setShowForceModal(true)}
                className="bg-[#c57d62] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#ae684f] transition flex items-center gap-2"
              >
                <PlusCircle className="size-4" /> Agendar Cita Manual (Forzar)
              </button>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="bg-white p-8 border border-zinc-200 text-center text-zinc-500">
                No hay citas programadas para el {filterDate}.
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf8f6] border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="p-4">Hora</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Servicio</th>
                      <th className="p-4">Teléfono</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredAppointments.map((appt) => (
                      <tr key={appt.id} className={appt.status === 'cancelled' ? 'bg-zinc-50 opacity-60' : ''}>
                        <td className="p-4 font-mono font-bold">{appt.start} - {appt.end}</td>
                        <td className="p-4 font-medium">
                          {appt.client_name}
                          {appt.client_nickname && (
                            <span className="text-xs text-zinc-400 block">({appt.client_nickname})</span>
                          )}
                        </td>
                        <td className="p-4">{appt.service_name}</td>
                        <td className="p-4 text-zinc-600">{appt.client_phone}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              appt.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : appt.confirmado
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {appt.status === 'cancelled'
                              ? 'Cancelada'
                              : appt.confirmado
                              ? 'Confirmada'
                              : 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {appt.status !== 'cancelled' && (
                            <>
                              {!appt.confirmado && (
                                <button
                                  onClick={() => handleConfirmAppointment(appt.id)}
                                  className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded hover:bg-emerald-800"
                                >
                                  Confirmar
                                </button>
                              )}
                              <button
                                onClick={() => handleSendReminder(appt.id)}
                                title="Enviar recordatorio WhatsApp"
                                className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-700"
                              >
                                Recordatorio
                              </button>
                              <button
                                onClick={() => handleAdminCancel(appt.id)}
                                className="text-xs bg-red-600 text-white px-2.5 py-1 rounded hover:bg-red-700"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SERVICIOS */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-bold">Gestión de Servicios</h2>
              <button
                onClick={() =>
                  setEditingService({
                    name: '',
                    description: '',
                    price_eur: 15,
                    duration_min: 30,
                    active: true,
                  })
                }
                className="bg-[#c57d62] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#ae684f]"
              >
                + Nuevo Servicio
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {services.map((svc) => (
                <div key={svc.id} className="bg-white p-5 border border-zinc-200 flex justify-between items-start shadow-sm">
                  <div>
                    <h3 className="font-serif font-bold text-lg">{svc.name}</h3>
                    <p className="text-xs text-zinc-500 mb-2">{svc.description}</p>
                    <div className="text-xs font-semibold text-zinc-700 space-x-3">
                      <span>Precio: {svc.price_eur} €</span>
                      <span>Duración: {svc.duration_min} min</span>
                      <span className={svc.active ? 'text-emerald-600' : 'text-red-500'}>
                        {svc.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingService(svc)}
                      className="text-xs border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="text-xs bg-red-600 text-white px-3 py-1.5 hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Editar/Crear Servicio */}
            {editingService && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <form onSubmit={handleSaveService} className="bg-white p-6 w-full max-w-md border shadow-lg space-y-4">
                  <h3 className="font-serif text-xl font-bold">
                    {editingService.id ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </h3>

                  <div>
                    <label className="block text-xs uppercase text-zinc-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editingService.name || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, name: e.target.value })
                      }
                      className="w-full p-2 border text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-zinc-600 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={editingService.description || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, description: e.target.value })
                      }
                      className="w-full p-2 border text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase text-zinc-600 mb-1">Precio (€)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={editingService.price_eur ?? 0}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            price_eur: parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-2 border text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-600 mb-1">Duración (min)</label>
                      <input
                        type="number"
                        step="5"
                        required
                        value={editingService.duration_min ?? 30}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            duration_min: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full p-2 border text-sm"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs uppercase text-zinc-600 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={editingService.active ?? true}
                      onChange={(e) =>
                        setEditingService({ ...editingService, active: e.target.checked })
                      }
                    />
                    Servicio Activo
                  </label>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="flex-1 border py-2 text-xs uppercase font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#c57d62] text-white py-2 text-xs uppercase font-semibold hover:bg-[#ae684f]"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HORARIOS BASE */}
        {activeTab === 'hours' && workingHours && (
          <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold">Configuración de Horario Semanal Base</h2>

            <div className="space-y-3">
              {Object.keys(dayNames).map((dayKey) => {
                const cfg = workingHours.days[dayKey] || { enabled: false, start: '10:00', end: '20:00' };
                return (
                  <div key={dayKey} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-zinc-100 gap-3">
                    <label className="flex items-center gap-3 w-36 font-medium text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfg.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...workingHours,
                            days: {
                              ...workingHours.days,
                              [dayKey]: { ...cfg, enabled: e.target.checked },
                            },
                          };
                          setWorkingHours(updated);
                        }}
                      />
                      {dayNames[dayKey]}
                    </label>

                    {cfg.enabled ? (
                      <div className="flex items-center gap-3 text-sm">
                        <span>Apertura:</span>
                        <input
                          type="time"
                          value={cfg.start}
                          onChange={(e) => {
                            const updated = {
                              ...workingHours,
                              days: {
                                ...workingHours.days,
                                [dayKey]: { ...cfg, start: e.target.value },
                              },
                            };
                            setWorkingHours(updated);
                          }}
                          className="p-1 border"
                        />
                        <span>Cierre:</span>
                        <input
                          type="time"
                          value={cfg.end}
                          onChange={(e) => {
                            const updated = {
                              ...workingHours,
                              days: {
                                ...workingHours.days,
                                [dayKey]: { ...cfg, end: e.target.value },
                              },
                            };
                            setWorkingHours(updated);
                          }}
                          className="p-1 border"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-zinc-200">
              <h3 className="font-serif text-lg font-bold mb-3">Pausa / Almuerzo</h3>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workingHours.lunch?.enabled ?? false}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        lunch: { ...(workingHours.lunch || { start: '13:00', end: '14:00' }), enabled: e.target.checked },
                      })
                    }
                  />
                  Habilitar pausa
                </label>

                {workingHours.lunch?.enabled && (
                  <div className="flex items-center gap-2">
                    <span>De:</span>
                    <input
                      type="time"
                      value={workingHours.lunch.start}
                      onChange={(e) =>
                        setWorkingHours({
                          ...workingHours,
                          lunch: { ...workingHours.lunch, start: e.target.value },
                        })
                      }
                      className="p-1 border"
                    />
                    <span>A:</span>
                    <input
                      type="time"
                      value={workingHours.lunch.end}
                      onChange={(e) =>
                        setWorkingHours({
                          ...workingHours,
                          lunch: { ...workingHours.lunch, end: e.target.value },
                        })
                      }
                      className="p-1 border"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveWorkingHours}
              disabled={savingHours}
              className="bg-[#c57d62] text-white px-6 py-3 uppercase tracking-wider text-xs font-semibold hover:bg-[#ae684f] transition disabled:opacity-50"
            >
              {savingHours ? 'Guardando...' : 'Guardar Horarios'}
            </button>
          </div>
        )}

        {/* TAB 4: BLOQUEOS Y EXCEPCIONES */}
        {activeTab === 'blockers' && (
          <div className="space-y-8">
            {/* Bloqueos */}
            <div className="bg-white p-6 border border-zinc-200 shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4">Bloqueos de Horas o Días Completo</h2>

              <form onSubmit={handleAddBlocker} className="grid sm:grid-cols-5 gap-3 mb-6 bg-[#faf8f6] p-4 border border-zinc-200 text-xs">
                <div>
                  <label className="block text-zinc-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newBlockerDate}
                    onChange={(e) => setNewBlockerDate(e.target.value)}
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Hora Inicio (Vacío = Todo el día)</label>
                  <input
                    type="time"
                    value={newBlockerStart}
                    onChange={(e) => setNewBlockerStart(e.target.value)}
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={newBlockerEnd}
                    onChange={(e) => setNewBlockerEnd(e.target.value)}
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Motivo</label>
                  <input
                    type="text"
                    value={newBlockerReason}
                    onChange={(e) => setNewBlockerReason(e.target.value)}
                    placeholder="Ej. Asunto personal"
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[#c57d62] text-white py-2 uppercase font-semibold hover:bg-[#ae684f]"
                  >
                    Añadir Bloqueo
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {blockers.length === 0 ? (
                  <p className="text-xs text-zinc-500">No hay bloqueos activos.</p>
                ) : (
                  blockers.map((b) => (
                    <div key={b.id} className="flex justify-between items-center p-3 border text-xs">
                      <div>
                        <span className="font-bold mr-2">{b.date}</span>
                        <span>
                          {b.start && b.end ? `${b.start} a ${b.end}` : 'Día Completo Bloqueado'}
                        </span>
                        {b.reason && <span className="text-zinc-500 ml-3">({b.reason})</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteBlocker(b.id)}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sobreescrituras Excepcionales */}
            <div className="bg-white p-6 border border-zinc-200 shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4">Excepciones de Horario por Fecha (Overrides)</h2>

              <form onSubmit={handleAddOverride} className="grid sm:grid-cols-6 gap-3 mb-6 bg-[#faf8f6] p-4 border border-zinc-200 text-xs">
                <div>
                  <label className="block text-zinc-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newOverrideDate}
                    onChange={(e) => setNewOverrideDate(e.target.value)}
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Estado</label>
                  <select
                    value={newOverrideEnabled ? 'true' : 'false'}
                    onChange={(e) => setNewOverrideEnabled(e.target.value === 'true')}
                    className="w-full p-2 border bg-white"
                  >
                    <option value="true">Abierto (Especial)</option>
                    <option value="false">Cerrado (Especial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Apertura</label>
                  <input
                    type="time"
                    value={newOverrideStart}
                    onChange={(e) => setNewOverrideStart(e.target.value)}
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Cierre</label>
                  <input
                    type="time"
                    value={newOverrideEnd}
                    onChange={(e) => setNewOverrideEnd(e.target.value)}
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1">Motivo</label>
                  <input
                    type="text"
                    value={newOverrideReason}
                    onChange={(e) => setNewOverrideReason(e.target.value)}
                    placeholder="Ej. Festivo abierto"
                    className="w-full p-2 border bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[#c57d62] text-white py-2 uppercase font-semibold hover:bg-[#ae684f]"
                  >
                    Guardar Excepción
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {overrides.length === 0 ? (
                  <p className="text-xs text-zinc-500">No hay excepciones configuradas.</p>
                ) : (
                  overrides.map((o) => (
                    <div key={o.date} className="flex justify-between items-center p-3 border text-xs">
                      <div>
                        <span className="font-bold mr-2">{o.date}</span>
                        <span className={o.enabled ? 'text-emerald-700' : 'text-red-700'}>
                          {o.enabled ? `Abierto: ${o.start} - ${o.end}` : 'Cerrado por excepción'}
                        </span>
                        {o.reason && <span className="text-zinc-500 ml-3">({o.reason})</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteOverride(o.date)}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Force Appointment */}
        {showForceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleForceAppointmentSubmit} className="bg-white p-6 w-full max-w-md border shadow-lg space-y-4">
              <h3 className="font-serif text-xl font-bold">Agendar Cita Manual (Admin)</h3>

              <div>
                <label className="block text-xs uppercase text-zinc-600 mb-1">Servicio *</label>
                <select
                  required
                  value={forceServiceId}
                  onChange={(e) => setForceServiceId(e.target.value)}
                  className="w-full p-2 border text-sm"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_min} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-zinc-600 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={forceDate}
                    onChange={(e) => setForceDate(e.target.value)}
                    className="w-full p-2 border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-600 mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={forceStart}
                    onChange={(e) => setForceStart(e.target.value)}
                    className="w-full p-2 border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-600 mb-1">Nombre Cliente *</label>
                <input
                  type="text"
                  required
                  value={forceClientName}
                  onChange={(e) => setForceClientName(e.target.value)}
                  className="w-full p-2 border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-600 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={forceClientPhone}
                  onChange={(e) => setForceClientPhone(e.target.value)}
                  className="w-full p-2 border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-600 mb-1">Nickname (opcional)</label>
                <input
                  type="text"
                  value={forceClientNickname}
                  onChange={(e) => setForceClientNickname(e.target.value)}
                  className="w-full p-2 border text-sm"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForceModal(false)}
                  className="flex-1 border py-2 text-xs uppercase font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingForce}
                  className="flex-1 bg-[#c57d62] text-white py-2 text-xs uppercase font-semibold hover:bg-[#ae684f]"
                >
                  {submittingForce ? 'Guardando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
