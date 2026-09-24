'use client';

import { useState, useEffect } from 'react';
import { api, Appointment, Service } from '@/lib/api';
import { Search, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Edit3 } from 'lucide-react';

export default function ManageBookingPage() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // Modifying states
  const [isModifying, setIsModifying] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [modifying, setModifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) return;

    setSearching(true);
    setErrorMsg('');
    setSuccessMsg('');
    setAppointment(null);
    setIsModifying(false);

    try {
      const appt = await api.gestionarLookup(code.trim(), phone.trim());
      setAppointment(appt);
      setNewDate(appt.date);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se encontró ninguna cita con esos datos.');
    } finally {
      setSearching(false);
    }
  };

  // Load available slots when newDate changes in modify mode
  useEffect(() => {
    if (isModifying && appointment && newDate) {
      setLoadingSlots(true);
      api
        .getAvailability(appointment.service_id, newDate)
        .then((res) => setAvailableSlots(res.slots || []))
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [isModifying, appointment, newDate]);

  const handleCancel = async () => {
    if (!appointment) return;
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    setCancelling(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.cancelAppointmentByClient(appointment.id, phone.trim());
      setSuccessMsg('Tu cita ha sido cancelada correctamente.');
      setAppointment({ ...appointment, status: 'cancelled' });
      setIsModifying(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cancelar la cita.');
    } finally {
      setCancelling(false);
    }
  };

  const handleModifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !newDate || !newStart) return;

    setModifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await api.modificarAppointment(
        appointment.id,
        phone.trim(),
        newDate,
        newStart
      );
      setAppointment(updated);
      setSuccessMsg('Tu cita ha sido modificada con éxito.');
      setIsModifying(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al modificar la cita.');
    } finally {
      setModifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] text-zinc-900 pb-20">
      {/* Top Bar */}
      <header className="bg-[#38312d] text-white py-6 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="font-serif text-2xl tracking-tight">
            ML Mimo Mento Nails Studio<span className="text-[#c57d62]">.</span>
          </a>
          <a
            href="/reservar"
            className="text-xs uppercase tracking-widest bg-[#c57d62] px-4 py-2 hover:bg-[#ae684f] transition"
          >
            Nueva reserva
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto mt-10 px-6">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Gestionar Mi Cita</h1>
          <p className="text-zinc-600 text-sm">
            Consulta, modifica o cancela tu cita ingresando tu código de reserva (8 caracteres) y tu teléfono.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm flex items-center gap-3">
            <CheckCircle className="size-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className="bg-white p-6 border border-zinc-200 shadow-sm mb-8 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
              Código de Reserva (8 dígitos/caracteres)
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej. a1b2c3d4"
              className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
              Teléfono Registrado
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Tu teléfono"
              className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62]"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full bg-[#c57d62] text-white py-3 uppercase tracking-wider text-xs font-semibold hover:bg-[#ae684f] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="size-4" />
            {searching ? 'Buscando cita...' : 'Buscar Cita'}
          </button>
        </form>

        {/* Detalle de la Cita */}
        {appointment && (
          <div className="bg-white border border-zinc-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-zinc-200 pb-4">
              <div>
                <span className="text-xs uppercase text-zinc-400 block">Código</span>
                <span className="font-mono text-xl font-bold text-[#c57d62]">
                  {appointment.id.slice(0, 8)}
                </span>
              </div>
              <span
                className={`px-3 py-1 text-xs uppercase font-semibold rounded ${
                  appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {appointment.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
              </span>
            </div>

            <div className="grid gap-3 text-sm mb-6">
              <div>
                <span className="text-xs text-zinc-400 block">Servicio</span>
                <p className="font-medium">{appointment.service_name}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Fecha y Hora</span>
                <p className="font-medium">
                  {appointment.date} de {appointment.start} a {appointment.end} hs
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Cliente</span>
                <p className="font-medium">{appointment.client_name}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Teléfono</span>
                <p className="font-medium">{appointment.client_phone}</p>
              </div>
            </div>

            {appointment.status !== 'cancelled' && !isModifying && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModifying(true)}
                  className="flex-1 bg-zinc-800 text-white py-3 uppercase tracking-wider text-xs font-semibold hover:bg-zinc-900 transition flex items-center justify-center gap-2"
                >
                  <Edit3 className="size-4" /> Modificar Cita
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white py-3 uppercase tracking-wider text-xs font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="size-4" /> {cancelling ? 'Cancelando...' : 'Cancelar Cita'}
                </button>
              </div>
            )}

            {/* Formulario de Modificación */}
            {isModifying && appointment.status !== 'cancelled' && (
              <form onSubmit={handleModifySubmit} className="mt-6 pt-6 border-t border-zinc-200 bg-[#faf8f6] p-4">
                <h3 className="font-serif text-lg font-bold mb-4">Seleccionar Nueva Fecha y Hora</h3>

                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                    Nueva Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setNewDate(e.target.value);
                      setNewStart('');
                    }}
                    className="w-full p-2.5 border border-zinc-300 bg-white"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                    Horarios Disponibles ({newDate})
                  </label>
                  {loadingSlots ? (
                    <p className="text-xs text-zinc-500 animate-pulse">Cargando disponibilidad...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-zinc-500">No hay horarios disponibles en esta fecha.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setNewStart(slot)}
                          className={`p-2 text-xs border font-medium ${
                            newStart === slot
                              ? 'bg-[#c57d62] text-white border-[#c57d62]'
                              : 'bg-white border-zinc-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModifying(false)}
                    className="flex-1 border border-zinc-300 py-2.5 uppercase tracking-wider text-xs font-semibold hover:bg-zinc-100 transition"
                  >
                    Cancelar Edición
                  </button>
                  <button
                    type="submit"
                    disabled={modifying || !newStart}
                    className="flex-1 bg-[#c57d62] text-white py-2.5 uppercase tracking-wider text-xs font-semibold hover:bg-[#ae684f] transition disabled:opacity-50"
                  >
                    {modifying ? 'Guardando...' : 'Confirmar Cambio'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
