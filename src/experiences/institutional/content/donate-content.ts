import { BriefcaseBusiness, CalendarHeart, CircleDollarSign, HandCoins, HandHeart, Landmark, ShieldCheck } from 'lucide-react'

import { surfacePaths } from '@/app/router/surface-paths'
import type { InstitutionalPageContent } from '@/experiences/institutional/content/site-content'

export const donatePageContent: InstitutionalPageContent = {
  hero: {
    eyebrow: 'Donaciones',
    title: 'Una página de donación diseñada para inspirar confianza y acción inmediata.',
    description:
      'El objetivo es presentar la generosidad como una extensión natural de la misión, con caminos claros y lenguaje sobrio.',
    primaryAction: {
      label: 'Contactar para donar',
      to: surfacePaths.institutional.contactUs,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Ver financiamiento',
      to: surfacePaths.institutional.projectFunding,
      variant: 'secondary',
    },
    aside: [
      {
        title: 'Donación guiada',
        description: 'Mientras no exista pago en línea, el canal principal debe seguir siendo claro y confiable.',
        icon: HandCoins,
      },
      {
        title: 'Compromiso institucional',
        description: 'La confianza se construye con lenguaje transparente y contexto suficiente.',
        icon: ShieldCheck,
      },
      {
        title: 'Impacto visible',
        description: 'La donación se conecta con historias, prioridades y frentes concretos.',
        icon: HandHeart,
      },
    ],
  },
  sections: [
    {
      type: 'feature-grid',
      tone: 'muted',
      lead: {
        eyebrow: 'Canales',
        title: 'Cómo se organiza el llamado a donar en esta fase.',
        description: 'Aunque el pago aún no sea transaccional, la experiencia debe sentirse real y útil.',
      },
      items: [
        {
          title: 'Donación institucional',
          description: 'Un canal principal para aportes generales y conversaciones de seguimiento.',
          icon: Landmark,
        },
        {
          title: 'Aporte para proyectos',
          description: 'Conexión con oportunidades que ya tienen alcance, necesidad y prioridad definidos.',
          icon: CircleDollarSign,
        },
        {
          title: 'Patrocinio de eventos',
          description: 'Apoyo a convenciones, encuentros y piezas de alcance comunitario.',
          icon: CalendarHeart,
        },
        {
          title: 'Apoyo en especie',
          description: 'Espacios, logística, servicios profesionales o activos de comunicación.',
          icon: BriefcaseBusiness,
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      lead: {
        eyebrow: 'Confianza',
        title: 'La decisión de donar necesita contexto, no ruido.',
        description: 'La página debe sentirse premium, sobria y pastoral a la vez.',
      },
      image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Manos extendidas en oración y apoyo comunitario',
      bodyTitle: 'Qué debe transmitir la página',
      bodyCopy: [
        'Un tono institucional cálido, prioridades visibles y una explicación sencilla de cómo se canaliza el apoyo.',
        'La interfaz debe invitar a la acción con gradientes, profundidad tonal y llamados claros, sin parecer una campaña agresiva.',
      ],
      highlights: [
        {
          title: 'Claridad',
          description: 'Qué se apoya y con qué propósito.',
        },
        {
          title: 'Cercanía',
          description: 'Cómo continuar la conversación con el equipo.',
        },
        {
          title: 'Seriedad',
          description: 'Qué señales de confianza institucional acompañan el flujo.',
        },
      ],
    },
  ],
  cta: {
    title: 'Convierte intención en una conversación de apoyo concreta.',
    description: 'Si la donación online llega después, esta primera versión ya prepara el puente correcto.',
    primaryAction: {
      label: 'Escribir al equipo',
      to: surfacePaths.institutional.contactUs,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Volver a home',
      to: surfacePaths.institutional.home,
      variant: 'ghost',
    },
  },
}
