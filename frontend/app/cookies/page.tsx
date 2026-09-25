'use client'

import { useState } from 'react'
import { Menu, X, ArrowLeft } from 'lucide-react'

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

export default function CookiesPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
      <div>
        <Header onMenu={() => setMenuOpen(true)} />
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c57d62] hover:underline mb-8">
            <ArrowLeft className="size-4" /> Volver al inicio
          </a>
          <h1 className="font-serif text-4xl md:text-5xl text-[#38312d] mb-8">Política de Cookies</h1>
          <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-[#38312d] mb-3">1. ¿Qué son las Cookies?</h2>
              <p>
                Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#38312d] mb-3">2. Cookies Utilizadas en este Sitio Web</h2>
              <p>
                En ML Mimo Mento Nails Studio utilizamos únicamente las cookies estrictamente necesarias para el correcto funcionamiento del portal y el almacenamiento técnico temporal durante el proceso de reserva de cita:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Cookies Técnicas de Sesión:</strong> Permiten al usuario la navegación a través de la web y la utilización de las diferentes opciones o servicios como la navegación entre secciones o almacenamiento del token de sesión de gestión.</li>
              </ul>
              <p className="mt-2">
                Este sitio no utiliza cookies publicitarias ni de seguimiento de terceros sin consentimiento previo.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[#38312d] mb-3">3. Gestión y Desactivación de Cookies</h2>
              <p>
                El usuario puede en cualquier momento desactivar o eliminar las cookies de este sitio web configurando las opciones de su navegador de Internet (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
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
