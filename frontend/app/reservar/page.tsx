'use client';

import { useState, useEffect, useMemo } from 'react';
import { api, Service, BusinessInfo } from '@/lib/api';
import { getServiceCategory } from '@/lib/utils';
import { Calendar, Clock, User, CheckCircle, ArrowLeft, AlertCircle, Phone, Mail, Scissors } from 'lucide-react';

const CATEGORY_ORDER = ['Manicura', 'Pedicura', 'Gel y Acrílico', 'Retoques', 'Otros'];

function groupServicesByCategory(list: Service[]) {
  const groups: Record<string, Service[]> = {};
  for (const service of list) {
    const category = getServiceCategory(service.name);
    if (!groups[category]) groups[category] = [];
    groups[category].push(service);
  }
  return CATEGORY_ORDER
    .filter((category) => groups[category]?.length)
    .map((category) => ({ category, items: groups[category] }));
}

export default function BookingPage() {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);

  // Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<{ id: string; name: string; role: string }>({
    id: 'equipo-ml',
    name: 'Especialista ML',
    role: 'Estilista / Nail Artist',
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Contact form
  const [clientName, setClientName] = useState('');
  const [clientNickname, setClientNickname] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [bookerName, setBookerName] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [optInWhatsapp, setOptInWhatsapp] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [svcs, bInfo] = await Promise.all([
          api.getServices(),
          api.getBusinessInfo().catch(() => null),
        ]);
        setServices(svcs);
        if (bInfo) {
          setBusinessInfo(bInfo);
          setSelectedProfessional({
            id: 'equipo-ml',
            name: 'Especialista ML',
            role: 'Estilista / Nail Artist',
          });
        }
      } catch (err: any) {
        setErrorMsg('Error al cargar servicios. Verifica que el servidor backend esté en ejecución.');
      } finally {
        setLoadingServices(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch slots when service or date changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoadingSlots(true);
      setErrorMsg('');
      api
        .getAvailability(selectedService.id, selectedDate)
        .then((res) => {
          setSlots(res.slots || []);
        })
        .catch((err: any) => {
          setErrorMsg(err.message || 'Error al obtener horarios disponibles.');
          setSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedService, selectedDate]);

  const handleServiceSelect = (svc: Service) => {
    setSelectedService(svc);
    setStep(2);
  };

  const handleProfessionalSelect = (pro: { id: string; name: string; role: string }) => {
    setSelectedProfessional(pro);
    setSelectedSlot('');
    setStep(3);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;
    if (!acceptedPolicy) {
      setErrorMsg('Debes aceptar la política del 50%.');
      return;
    }
    if (!optInWhatsapp) {
      setErrorMsg('Debes aceptar recibir confirmaciones por WhatsApp.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const appt = await api.createAppointment({
        service_id: selectedService.id,
        date: selectedDate,
        start: selectedSlot,
        client_name: clientName.trim(),
        client_nickname: clientNickname.trim() || undefined,
        client_phone: clientPhone.trim(),
        client_email: clientEmail.trim() || undefined,
        booker_name: bookerName.trim() || undefined,
        accepted_policy: acceptedPolicy,
        opt_in_whatsapp: optInWhatsapp,
      });

      setCreatedAppointment(appt);
      setStep(5);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  const professionals = [
    { id: 'equipo-ml', name: 'Especialista ML', role: 'Estilista & Nail Artist Especialista' },
  ];

  const categorizedServices = useMemo(() => groupServicesByCategory(services), [services]);

  return (
    <div className="min-h-screen bg-[#faf8f6] text-zinc-900 pb-20">
      {/* Top Bar */}
      <header className="bg-[#38312d] text-white py-6 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="font-serif text-2xl tracking-tight">
            ML Mimo Mento Nails Studio<span className="text-[#c57d62]">.</span>
          </a>
          <a
            href="/gestionar"
            className="text-xs uppercase tracking-widest bg-[#c57d62] px-4 py-2 hover:bg-[#ae684f] transition"
          >
            Gestionar cita
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-10 px-6">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Reservar Cita</h1>
          <p className="text-zinc-600 text-sm">
            ML Mimo Mento Nails Studio
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between border-b border-zinc-300 pb-4 mb-8 text-xs font-semibold uppercase tracking-wider text-zinc-500 overflow-x-auto">
          <span className={step >= 1 ? 'text-[#c57d62]' : ''}>1. Servicio</span>
          <span>&rarr;</span>
          <span className={step >= 2 ? 'text-[#c57d62]' : ''}>2. Profesional</span>
          <span>&rarr;</span>
          <span className={step >= 3 ? 'text-[#c57d62]' : ''}>3. Fecha y Hora</span>
          <span>&rarr;</span>
          <span className={step >= 4 ? 'text-[#c57d62]' : ''}>4. Datos</span>
          <span>&rarr;</span>
          <span className={step === 5 ? 'text-[#c57d62]' : ''}>5. Confirmación</span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Selección de Servicio */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-2xl mb-4">Selecciona un Servicio</h2>
            {loadingServices ? (
              <p className="text-zinc-500 text-sm animate-pulse">Cargando servicios...</p>
            ) : services.length === 0 ? (
              <p className="text-zinc-500 text-sm">No hay servicios disponibles por el momento.</p>
            ) : (
              <div className="space-y-10">
                {categorizedServices.map(({ category, items }) => (
                  <div key={category}>
                    <h3 className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c57d62]">
                      <span className="h-px w-8 bg-[#c57d62]/40" /> {category}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {items.map((svc) => (
                        <div
                          key={svc.id}
                          onClick={() => handleServiceSelect(svc)}
                          className="rounded-2xl bg-[#faf8f6] p-5 cursor-pointer transition duration-300 shadow-[8px_8px_18px_#e2d6cc,-8px_-8px_18px_#ffffff] hover:shadow-[4px_4px_10px_#e2d6cc,-4px_-4px_10px_#ffffff]"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-serif text-lg font-bold">{svc.name}</h3>
                            <span className="shrink-0 rounded-full bg-[#faf8f6] px-3 py-1 font-semibold text-[#c57d62] shadow-[inset_2px_2px_5px_#e2d6cc,inset_-2px_-2px_5px_#ffffff]">
                              {svc.price_eur > 0 ? `${svc.price_eur} €` : 'Consultar'}
                            </span>
                          </div>
                          {svc.description && (
                            <p className="text-xs text-zinc-500 mb-3">{svc.description}</p>
                          )}
                          <p className="text-xs text-zinc-400 flex items-center gap-1">
                            <Clock className="size-3.5" /> {svc.duration_min} min
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Selección de Profesional */}
        {step === 2 && selectedService && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft className="size-4" /> Cambiar servicio
            </button>

            <div className="p-4 bg-white border border-zinc-200 mb-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase text-zinc-400">Servicio seleccionado:</span>
                <h3 className="font-serif text-lg font-bold">{selectedService.name}</h3>
              </div>
              <span className="text-[#c57d62] font-semibold">
                {selectedService.duration_min} min
              </span>
            </div>

            <h2 className="font-serif text-2xl mb-4">Selecciona un Profesional</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {professionals.map((pro) => (
                <div
                  key={pro.id}
                  onClick={() => handleProfessionalSelect(pro)}
                  className={`p-5 bg-white border cursor-pointer transition shadow-sm hover:shadow flex items-center gap-4 ${
                    selectedProfessional?.id === pro.id
                      ? 'border-[#c57d62] ring-1 ring-[#c57d62]'
                      : 'border-zinc-200 hover:border-[#c57d62]'
                  }`}
                >
                  <div className="size-12 rounded-full bg-[#38312d] text-white flex items-center justify-center font-serif text-xl font-bold">
                    {pro.name[0]}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">{pro.name}</h3>
                    <p className="text-xs text-zinc-500">{pro.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Selección de Fecha y Hora */}
        {step === 3 && selectedService && selectedProfessional && (
          <div>
            <button
              onClick={() => setStep(2)}
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft className="size-4" /> Cambiar profesional
            </button>

            <div className="p-4 bg-white border border-zinc-200 mb-6 flex justify-between items-center text-sm">
              <div>
                <span className="text-xs uppercase text-zinc-400">Resumen:</span>
                <p className="font-bold">{selectedService.name}</p>
                <p className="text-xs text-zinc-500">Profesional: {selectedProfessional.name}</p>
              </div>
              <span className="text-[#c57d62] font-semibold">
                {selectedService.duration_min} min
              </span>
            </div>

            <h2 className="font-serif text-2xl mb-4">Selecciona Fecha y Hora</h2>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-2 font-medium">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto p-3 border border-zinc-300 bg-white focus:outline-none focus:border-[#c57d62]"
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-2 font-medium">
                Horarios Disponibles ({selectedDate})
              </label>
              {loadingSlots ? (
                <p className="text-zinc-500 text-sm animate-pulse">Buscando horarios...</p>
              ) : slots.length === 0 ? (
                <p className="text-zinc-500 text-sm bg-zinc-100 p-4 rounded">
                  No hay horarios disponibles para esta fecha. Intenta con otra fecha.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 text-center border text-sm font-medium transition ${
                        selectedSlot === slot
                          ? 'bg-[#c57d62] text-white border-[#c57d62]'
                          : 'bg-white border-zinc-200 hover:border-[#c57d62]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(4)}
                  className="bg-[#c57d62] text-white px-6 py-3 uppercase tracking-wider text-xs font-semibold hover:bg-[#ae684f] transition"
                >
                  Continuar a tus datos &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Formulario de Contacto */}
        {step === 4 && selectedService && selectedProfessional && selectedSlot && (
          <div>
            <button
              onClick={() => setStep(3)}
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft className="size-4" /> Cambiar fecha/hora
            </button>

            <div className="p-4 bg-white border border-zinc-200 mb-6 text-sm grid gap-1">
              <p>
                <strong>Servicio:</strong> {selectedService.name} ({selectedService.duration_min} min)
              </p>
              <p>
                <strong>Profesional:</strong> {selectedProfessional.name}
              </p>
              <p>
                <strong>Fecha y Hora:</strong> {selectedDate} a las {selectedSlot} hs
              </p>
            </div>

            <h2 className="font-serif text-2xl mb-4">Tus Datos de Contacto</h2>

            <form onSubmit={handleBookingSubmit} className="space-y-4 bg-white p-6 border border-zinc-200 shadow-sm">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                  Apodo / Nickname (opcional)
                </label>
                <input
                  type="text"
                  value={clientNickname}
                  onChange={(e) => setClientNickname(e.target.value)}
                  placeholder="Ej. Juanito"
                  className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                  Teléfono (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej. +34612345678"
                  className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1 font-medium">
                  Reserva para otra persona (opcional)
                </label>
                <input
                  type="text"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="Tu nombre si la reserva es para un amigo/familiar"
                  className="w-full p-3 border border-zinc-300 focus:outline-none focus:border-[#c57d62]"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedPolicy}
                    onChange={(e) => setAcceptedPolicy(e.target.checked)}
                    className="mt-1 accent-[#c57d62]"
                  />
                  <span className="text-xs text-zinc-600 leading-tight">
                    Acepto la política de la reserva (cancelación con al menos 12h de antelación). *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={optInWhatsapp}
                    onChange={(e) => setOptInWhatsapp(e.target.checked)}
                    className="mt-1 accent-[#c57d62]"
                  />
                  <span className="text-xs text-zinc-600 leading-tight">
                    Acepto recibir confirmación y recordatorio de la cita por WhatsApp. *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 bg-[#c57d62] text-white py-4 uppercase tracking-widest text-xs font-semibold hover:bg-[#ae684f] transition disabled:opacity-50"
              >
                {submitting ? 'Procesando reserva...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: Confirmación exitosa */}
        {step === 5 && createdAppointment && (
          <div className="bg-white p-8 border border-zinc-200 text-center shadow-sm">
            <CheckCircle className="size-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-bold mb-2">¡Reserva Confirmada!</h2>
            <p className="text-zinc-600 text-sm mb-6">
              Tu cita se ha registrado con éxito. Te esperamos en ML Mimo Mento Nails Studio con {selectedProfessional.name}.
            </p>

            <div className="bg-[#faf8f6] p-6 border border-zinc-200 text-left max-w-md mx-auto mb-8 space-y-3 text-sm">
              <div>
                <span className="text-xs text-zinc-400 uppercase block">Código de Reserva</span>
                <span className="font-mono text-lg font-bold text-[#c57d62]">
                  {createdAppointment.id.slice(0, 8)}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 uppercase block">Servicio</span>
                <span className="font-medium">{createdAppointment.service_name}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 uppercase block">Profesional</span>
                <span className="font-medium">{selectedProfessional.name}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 uppercase block">Fecha y Hora</span>
                <span className="font-medium">
                  {createdAppointment.date} a las {createdAppointment.start} hs
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 uppercase block">Cliente</span>
                <span className="font-medium">{createdAppointment.client_name}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 uppercase block">Teléfono</span>
                <span className="font-medium">{createdAppointment.client_phone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/"
                className="px-6 py-3 border border-zinc-300 text-xs uppercase tracking-wider font-semibold hover:bg-zinc-100 transition"
              >
                Volver al Inicio
              </a>
              <a
                href="/gestionar"
                className="px-6 py-3 bg-[#c57d62] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#ae684f] transition"
              >
                Ir a Gestionar Cita
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
