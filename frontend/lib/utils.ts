import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getServiceCategory(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('pedicure')) return 'Pedicura'
  if (n.includes('manicure')) return 'Manicura'
  if (n.includes('retirada') || n.includes('arreglo')) return 'Retoques'
  if (n.includes('gel') || n.includes('acríl') || n.includes('acril') || n.includes('polygel')) return 'Gel y Acrílico'
  return 'Otros'
}
