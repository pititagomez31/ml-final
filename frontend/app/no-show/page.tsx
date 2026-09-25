'use client'

import { useState } from 'react'
import { Menu, X, ArrowLeft, Clock, AlertTriangle } from 'lucide-react'

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

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="bg-[#38312d] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="ML Mimo Mento Nails Studio" className="h-10 w-auto object-contain" />
        </a>
        <nav className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 md:flex">
          <a href="/#servicios" className="transition-colors hover:text-white">Servicios</a>
          <a href="/gestionar" className="transition-colors hover:text-white">Gestionar Cita</a>
          <a href="/#equipo" className="transition-colors hover:text-white">Equipo</a>
          <a href="/#contacto" className="transition-colors hover:text-white">Contacto</a>
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

export default function NoShowPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
      <div>
        <Header onMenu={() => setMenuOpen(true)} />
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c57d62] hover:underline mb-8">
            <ArrowLeft className="size-4" /> Volver al inicio
          </a>
          <h1 className="font-serif text-4xl md:text-5xl text-[#38312d] mb-8">Política No-Show y Cancelaciones</h1>
          <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6 leading-relaxed">
            <div className="bg-[#e8ddd6] p-6 border-l-4 border-[#c57d62] my-6">
              <p className="font-medium text-[#38312d] text-base">
                Para mantener la máxima calidad en el servicio y respetar el tiempo de todas nuestras clientas, aplicamos rigurosamente nuestra política de puntualidad y asistencia.
              </p>
            </div>

            <section>
              <h2 className="font-serif text-2xl text-[#38312d] mb-3 flex items-center gap-2">
                <Clock className="size-6 text-[#c57d62]" /> 1. Tolerancia de Puntualidad (5 minutos)
              </h2>
              <p>
                Disponemos de un margen de tolerancia máximo de <strong>5 minutos</strong> respecto a la hora acordada para tu cita.
              </p>
              <p className="mt-2">
                Si llegas más de 5 minutos tarde, lamentablemente la cita podrá ser cancelada automáticamente para no perjudicar los horarios de las siguientes clientas citadas.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#38312d] mb-3 flex items-center gap-2">
                <AlertTriangle className="size-6 text-[#c57d62]" /> 2. Cancelaciones e Inasistencias (No-Show)
              </h2>
              <p>
                Puedes cancelar o modificar tu cita sin penalización con al menos <strong>12 horas de antelación</strong> mediante nuestro portal de gestión en línea.
              </p>
              <p className="mt-2">
                En caso de no presentarte a la cita sin previo aviso (No-Show) o de cancelar con menos de 12 horas de antelación, se exigirá el abono por adelantado del <strong>50% del valor del servicio</strong> reservado para poder autorizar y agendar futuras reservas en nuestro estudio.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#38312d] mb-3">3. Agradecimiento</h2>
              <p>
                Agradecemos enormemente tu comprensión y colaboración. Tu puntualidad nos permite ofrecer a cada persona el tiempo y dedicación que se merece.
              </p>
            </section>
          </div>
        </div>
      </div>
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
            <a href="/#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="/#equipo" onClick={() => setMenuOpen(false)}>Equipo</a>
            <a href="/#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
          </nav>
        </div>
      )}
    </main>
  )
}
