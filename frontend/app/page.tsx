'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowRight, Clock3, MapPin, Menu, X, ExternalLink, Star } from 'lucide-react'
import { api, Service } from '@/lib/api'
import { getServiceCategory } from '@/lib/utils'

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  )
}

const FALLBACK_SERVICES: Service[] = [
  { id: '1', name: 'Manicure tradicional', description: '', price_eur: 25, duration_min: 30, active: true },
  { id: '2', name: 'Manicure semipermanente', description: '', price_eur: 30, duration_min: 60, active: true },
  { id: '3', name: 'Manicure semipermanente + refuerzo', description: '', price_eur: 35, duration_min: 90, active: true },
  { id: '4', name: 'Manicure semipermanente + nivelación', description: '', price_eur: 35, duration_min: 90, active: true },
  { id: '5', name: 'Retirada semipermanente', description: '', price_eur: 8, duration_min: 15, active: true },
  { id: '6', name: 'Puesta gel/acrílico/polygel', description: '', price_eur: 50, duration_min: 150, active: true },
  { id: '7', name: 'Mantenimiento gel/acrílico/polygel', description: '', price_eur: 40, duration_min: 120, active: true },
  { id: '8', name: 'Retirada gel/acrílico', description: '', price_eur: 15, duration_min: 25, active: true },
  { id: '9', name: 'Arreglo uña semipermanente', description: '', price_eur: 2, duration_min: 10, active: true },
  { id: '10', name: 'Arreglo uña gel/polygel', description: '', price_eur: 3, duration_min: 10, active: true },
  { id: '11', name: 'Pedicure tradicional', description: '', price_eur: 28, duration_min: 60, active: true },
  { id: '12', name: 'Pedicure tradicional SPA', description: '', price_eur: 30, duration_min: 60, active: true },
  { id: '13', name: 'Pedicure semipermanente', description: '', price_eur: 30, duration_min: 60, active: true },
  { id: '14', name: 'Pedicure semipermanente SPA', description: '', price_eur: 35, duration_min: 60, active: true },
  { id: '15', name: 'Gel X', description: '', price_eur: 50, duration_min: 120, active: true },
]

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function SectionIntro({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy: string; light?: boolean }) {
  return (
    <div className={`max-w-2xl ${light ? 'text-white' : ''}`}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c57d62]">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-[1.05] tracking-[-0.03em] md:text-5xl">{title}</h2>
      <p className={`mt-6 max-w-lg text-base leading-7 ${light ? 'text-white/70' : 'text-zinc-600'}`}>{copy}</p>
    </div>
  )
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10 lg:py-6">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="ML Mimo Mento Nails Studio" className="h-48 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] md:h-56" />
        </a>
        <nav className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 md:flex">
          <a href="#servicios" className="transition-colors hover:text-white">Servicios</a>
          <a href="/gestionar" className="transition-colors hover:text-white">Gestionar Cita</a>
          <a href="#equipo" className="transition-colors hover:text-white">Equipo</a>
          <a href="#contacto" className="transition-colors hover:text-white">Contacto</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="/reservar" className="hidden border border-white/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-zinc-900 sm:block">
            Reservar
          </a>
          <button aria-label="Abrir menú" onClick={onMenu} className="flex size-11 items-center justify-center border border-white/40 text-white md:hidden">
            <Menu />
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[880px] items-center overflow-hidden bg-[#5d4a42] pb-16 md:min-h-[960px] md:pb-24">
      <img src="/images/hero-spa.png" alt="ML Mimo Mento Nails Studio" className="absolute inset-0 size-full object-cover object-center opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/20" />
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl text-white">
          <h1 className="font-serif text-5xl leading-[0.93] tracking-[-0.055em] md:text-7xl">
            Tu momento.<br />
            <em className="font-normal text-[#c57d62]">Tu belleza.</em><br />
            Tu espacio.
          </h1>
          <p className="mt-8 max-w-md text-base leading-7 text-white/80">
            Descubre una experiencia de belleza diseñada para que te sientas tan bien como te ves.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="/reservar"
              className="group inline-flex items-center gap-5 rounded-full bg-[#c57d62] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[6px_6px_14px_rgba(0,0,0,0.35),-4px_-4px_12px_rgba(255,255,255,0.15),inset_1px_1px_2px_rgba(255,255,255,0.3)] transition duration-300 hover:bg-[#ae684f] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.35),-2px_-2px_8px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.25)] active:scale-[0.98]"
            >
              Reservar mi cita <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#servicios" className="inline-flex items-center gap-3 px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 transition hover:text-white">
              Descubrir tratamientos <ArrowDown />
            </a>
          </div>
        </div>
        <div className="mt-20 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/60">
          <span className="size-2 rounded-full bg-[#e7b4a1]" /> Tu ritual empieza aquí
        </div>
      </div>
    </section>
  )
}

const CATEGORY_ORDER = ['Manicura', 'Pedicura', 'Gel y Acrílico', 'Retoques', 'Otros']

function groupServicesByCategory(list: Service[]) {
  const groups: Record<string, Service[]> = {}
  for (const service of list) {
    const category = getServiceCategory(service.name)
    if (!groups[category]) groups[category] = []
    groups[category].push(service)
  }
  return CATEGORY_ORDER
    .filter((category) => groups[category]?.length)
    .map((category) => ({ category, items: groups[category] }))
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card flex flex-col justify-between rounded-2xl bg-[#faf8f6] p-6 shadow-[8px_8px_18px_#e2d6cc,-8px_-8px_18px_#ffffff] transition duration-300 hover:shadow-[4px_4px_10px_#e2d6cc,-4px_-4px_10px_#ffffff]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-medium text-[#38312d]">{service.name}</h3>
          <span className="shrink-0 rounded-full bg-[#faf8f6] px-3 py-1 font-serif text-base font-semibold text-[#c57d62] shadow-[inset_2px_2px_5px_#e2d6cc,inset_-2px_-2px_5px_#ffffff]">
            {service.price_eur}€
          </span>
        </div>
        {service.description && (
          <p className="mt-2 text-sm text-zinc-500">{service.description}</p>
        )}
        <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
          <Clock3 className="size-3.5" /> {formatDuration(service.duration_min)}
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <a
          href={`/reservar?service=${service.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#faf8f6] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c57d62] shadow-[4px_4px_10px_#e2d6cc,-4px_-4px_10px_#ffffff] transition duration-300 hover:text-[#38312d] hover:shadow-[inset_3px_3px_7px_#e2d6cc,inset_-3px_-3px_7px_#ffffff]"
        >
          Reservar <ArrowRight className="size-3.5" />
        </a>
      </div>
    </article>
  )
}

function Services() {
  const [serviceList, setServiceList] = useState<Service[]>(FALLBACK_SERVICES)

  useEffect(() => {
    api.getServices()
      .then((data) => {
        if (data && data.length > 0) {
          setServiceList(data.filter(s => s.active))
        }
      })
      .catch(() => {})
  }, [])

  const categorized = useMemo(() => groupServicesByCategory(serviceList), [serviceList])

  return (
    <section id="servicios" className="bg-[#faf8f6] px-6 py-14 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Nuestros servicios"
          title="Nuestros servicios"
          copy="Cada tratamiento está pensado para regalarte un momento de cuidado, calma y expresión personal."
        />
        <div className="mt-16 space-y-14">
          {categorized.map(({ category, items }) => (
            <div key={category}>
              <h3 className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c57d62]">
                <span className="h-px w-8 bg-[#c57d62]/40" /> {category}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => (
                  <ServiceCard key={service.id || service.name} service={service} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ManageBookingSection() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')

  const handleManage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !phone) return
    router.push(`/gestionar?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`)
  }

  return (
    <section className="bg-[#faf8f6] border-t border-[#e8ddd6] px-6 py-14 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-4xl bg-white border border-[#e8ddd6] p-8 md:p-12 shadow-sm">
        <div className="text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c57d62]">Gestión de reservas</p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#38312d]">¿Ya tienes una cita?</h2>
          <p className="mt-3 text-base text-zinc-600">Consulta, modifica o cancela tu reserva.</p>
        </div>
        <form onSubmit={handleManage} className="mt-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/2">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-2">
              Código de reserva (8 caracteres)
            </label>
            <input
              type="text"
              maxLength={8}
              placeholder="Ej: a1b2c3d4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-zinc-300 bg-[#faf8f6] px-4 py-3 text-sm text-zinc-900 focus:border-[#c57d62] focus:outline-none"
              required
            />
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-2">
              Tu teléfono
            </label>
            <input
              type="tel"
              placeholder="Ej: 612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-zinc-300 bg-[#faf8f6] px-4 py-3 text-sm text-zinc-900 focus:border-[#c57d62] focus:outline-none"
              required
            />
          </div>
          <div className="w-full md:w-auto md:self-end">
            <button
              type="submit"
              className="w-full md:w-auto bg-[#c57d62] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#ae684f] whitespace-nowrap"
            >
              Gestionar mi cita
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

function OurWork() {
  const images = ['/trabajo1.jpg', '/trabajo2.jpg', '/trabajo3.jpg', '/trabajo4.jpg', '/trabajo5.jpg', '/trabajo6.jpg']

  return (
    <section className="scroll-reveal bg-[#faf8f6] px-6 py-14 lg:px-10 lg:py-20 border-t border-[#e8ddd6]">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Galería"
          title="Nuestro trabajo"
          copy="Detalles y trabajos realizados en ML Mimo Mento Nails Studio."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((img, index) => (
            <div key={index} className="aspect-square overflow-hidden bg-[#e8ddd6]">
              <img
                src={img}
                alt={`Trabajo ML Mimo Mento ${index + 1}`}
                className="size-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TeamProfessional() {
  return (
    <section id="equipo" className="bg-[#e8ddd6] px-6 py-14 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Nuestra profesional"
          title="Nuestra profesional"
          copy="Conoce a quien está detrás de cada tratamiento."
        />
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="aspect-[4/5] overflow-hidden bg-[#faf8f6] border border-white/40 shadow-sm">
            <img src="/dore.jpg" alt="Dorelitz" className="size-full object-cover object-center" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-serif text-4xl text-[#38312d]">Dorelitz</h3>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#c57d62]">Fundadora & Nail Artist</p>
            <p className="mt-6 text-base leading-relaxed text-zinc-700">
              Gracias por tu fidelidad y por depositar tu confianza en nosotros. Cada día trabajamos para brindarte lo mejor de nuestro servicio, y en este camino hemos vivido mil momentos que nos han hecho crecer, y otros tantos que nos han desafiado. Hoy podemos decir con orgullo que seguimos aquí, gracias a ti. Tu confianza es el motor que nos impulsa a cuidar cada detalle, cada uña, cada momento. Bienvenida a tu espacio.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function LocationSection() {
  return (
    <section id="contacto" className="bg-[#faf8f6] px-6 py-14 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Ubicación"
          title="Visítanos"
          copy="Tu lugar de calma en Tenerife."
        />
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-6 text-sm text-zinc-700">
            <p className="flex items-start gap-3 text-base">
              <MapPin className="size-5 shrink-0 text-[#c57d62] mt-0.5" />
              <span>Calle Pedro Guezala, 3, Local A 1, 38007 Santa Cruz de Tenerife</span>
            </p>
            <a
              href="https://maps.app.goo.gl/whP5H8hSTnxkyDSb6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c57d62] hover:underline"
            >
              Cómo llegar <ExternalLink className="size-4" />
            </a>
          </div>
          <div className="aspect-[16/9] w-full overflow-hidden border border-[#e8ddd6] bg-zinc-100 shadow-sm">
            <iframe
              title="Google Maps Location"
              src="https://www.google.com/maps?q=Calle+Pedro+Guezala+3+Local+A+1+38007+Santa+Cruz+de+Tenerife&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function GoogleReviewsSection() {
  return (
    <section className="bg-white border-t border-[#e8ddd6] px-6 py-14 lg:px-10 lg:py-20 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="inline-flex items-center justify-center gap-1 mb-4 text-[#c57d62]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-5 fill-current" />
          ))}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-[#38312d]">¿Te gustó el resultado?</h2>
        <p className="mt-4 text-base text-zinc-600">
          Cuéntalo en Google y ayuda a otras clientas a descubrirnos.
        </p>
        <div className="mt-8">
          <a
            href="https://maps.app.goo.gl/whP5H8hSTnxkyDSb6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#c57d62] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#ae684f]"
          >
            Dejar reseña en Google <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

function SocialFollowSection() {
  return (
    <section className="bg-[#faf8f6] border-t border-[#e8ddd6] px-6 py-14 lg:px-10 lg:py-20 text-center">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c57d62]">Comunidad</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#38312d]">Síguenos</h2>
        <p className="mt-4 text-base text-zinc-600">
          Descubre más trabajos y novedades en nuestras redes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://www.instagram.com/dlmimomentonailsstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-[#c57d62] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c57d62] transition hover:bg-[#c57d62] hover:text-white"
          >
            <InstagramIcon className="size-4" /> Instagram
          </a>
          <a
            href="https://www.facebook.com/share/1CZHzac66L/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-[#c57d62] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c57d62] transition hover:bg-[#c57d62] hover:text-white"
          >
            <FacebookIcon className="size-4" /> Facebook
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#38312d] px-6 py-12 text-white lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <a href="/" className="inline-block">
            <img src="/logo.png" alt="ML Mimo Mento Nails Studio" className="h-10 w-auto object-contain" />
          </a>
          <p className="mt-2 text-xs text-white/50">Calle Pedro Guezala, 3, Local A 1, 38007 Santa Cruz de Tenerife</p>
        </div>
        <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.16em] text-white/60">
          <a href="/legal" className="hover:text-white">Legal</a>
          <a href="/privacidad" className="hover:text-white">Privacidad</a>
          <a href="/cookies" className="hover:text-white">Cookies</a>
          <a href="/no-show" className="hover:text-white">Política no-show</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.instagram.com/dlmimomentonailsstudio" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-white">
            <InstagramIcon className="size-5" />
          </a>
          <a href="https://www.facebook.com/share/1CZHzac66L/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/60 hover:text-white">
            <FacebookIcon className="size-5" />
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 gap-4">
        <p>© 2026 ML Mimo Mento Nails Studio · hecho con <a href="https://tupaginawebpersonalizada.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Propósito</a> en Tenerife</p>
      </div>
    </footer>
  )
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main>
      <div className="relative">
        <Header onMenu={() => setMenuOpen(true)} />
        <Hero />
      </div>
      <Services />
      <ManageBookingSection />
      <OurWork />
      <TeamProfessional />
      <LocationSection />
      <GoogleReviewsSection />
      <SocialFollowSection />
      <Footer />

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#38312d] p-6 text-white">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="ML Mimo Mento" className="h-8 w-auto object-contain" />
            <button aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} className="flex size-11 items-center justify-center border border-white/30">
              <X />
            </button>
          </div>
          <nav className="mt-16 flex flex-col gap-7 font-serif text-3xl">
            <a href="/reservar" onClick={() => setMenuOpen(false)}>Reservar Cita</a>
            <a href="/gestionar" onClick={() => setMenuOpen(false)}>Gestionar Cita</a>
            <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#equipo" onClick={() => setMenuOpen(false)}>Equipo</a>
            <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
          </nav>
          <div className="mt-auto border-t border-white/15 pt-6 text-sm text-white/55">
            <p>ML Mimo Mento Nails Studio · Tenerife</p>
          </div>
        </div>
      )}
    </main>
  )
}
