import { BookOpenText, Building2, CalendarHeart, Church, HandCoins, HandHeart, ShieldCheck } from 'lucide-react'

import { surfacePaths } from '@/app/router/surface-paths'
import type { InstitutionalPageContent } from '@/experiences/institutional/content/site-content'

export const projectsPageContent: InstitutionalPageContent = {
  hero: {
    eyebrow: 'Proyectos',
    title: 'Proyectos que convierten intención institucional en impacto visible.',
    description:
      'La web de proyectos debe ayudar a entender áreas de trabajo, prioridades, oportunidades de colaboración y caminos de financiamiento con una narrativa confiable.',
    primaryAction: {
      label: 'Ver financiamiento',
      to: surfacePaths.institutional.projectFunding,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Contactar equipo',
      to: surfacePaths.institutional.contactUs,
      variant: 'secondary',
    },
    aside: [
      {
        title: 'Enfoque misional',
        description: 'Cada proyecto se presenta desde necesidad, propósito y resultados esperados.',
        icon: Church,
      },
      {
        title: 'Gobernanza clara',
        description: 'Priorización, seguimiento y comunicación institucional consistente.',
        icon: ShieldCheck,
      },
      {
        title: 'Oportunidades abiertas',
        description: 'Financiamiento, voluntariado, difusión y alianzas estratégicas.',
        icon: HandCoins,
      },
    ],
  },
  sections: [
    {
      type: 'feature-grid',
      lead: {
        eyebrow: 'Áreas',
        title: 'Cuatro líneas para organizar el impacto.',
        description: 'La experiencia debe permitir escanear rápido sin convertir la web en un dashboard frío.',
      },
      items: [
        {
          title: 'Comunidad y servicio',
          description: 'Proyectos que responden a necesidades locales con acompañamiento, voluntariado y recursos.',
          icon: HandHeart,
        },
        {
          title: 'Formación y mentoría',
          description: 'Iniciativas para desarrollar liderazgo, ética profesional y madurez espiritual.',
          icon: BookOpenText,
        },
        {
          title: 'Eventos y alcance',
          description: 'Convenciones, campañas y momentos editoriales que amplifican la misión.',
          icon: CalendarHeart,
        },
        {
          title: 'Infraestructura para crecer',
          description: 'Herramientas, activos y capacidades que fortalecen la operación institucional.',
          icon: Building2,
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      tone: 'muted',
      lead: {
        eyebrow: 'Método',
        title: 'Un marco simple para elegir y sostener iniciativas.',
        description: 'La narrativa debe sentirse seria y bien curada, no improvisada.',
      },
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Equipo planeando proyectos alrededor de una mesa',
      bodyTitle: 'Cómo se leen y priorizan los proyectos',
      bodyCopy: [
        'Cada iniciativa se comunica desde su necesidad real, la respuesta propuesta, los recursos requeridos y el seguimiento esperado.',
        'La web debe ayudar a que líderes, donantes y voluntarios entiendan dónde una oportunidad ya está madura y dónde todavía se está formando.',
      ],
      highlights: [
        {
          title: 'Necesidad',
          description: 'Contexto claro y humano, no solo cifras.',
        },
        {
          title: 'Respuesta',
          description: 'Qué se hará, con quién y para qué.',
        },
        {
          title: 'Sostenibilidad',
          description: 'Cómo se cuidará continuidad, comunicación y cierre.',
        },
      ],
    },
    {
      type: 'list',
      lead: {
        eyebrow: 'Iniciativas',
        title: 'Ejemplos de iniciativas para la primera fase editorial.',
        description: 'Estas colecciones locales sirven como punto de partida antes de una futura fuente dinámica.',
      },
      items: [
        {
          title: 'Red de mentoría profesional',
          description: 'Pareos, sesiones temáticas y acompañamiento con enfoque de fe en el mercado.',
          tag: 'Mentoría',
        },
        {
          title: 'Convención anual y circuitos regionales',
          description: 'Programación, comunicación, materiales y cobertura de experiencias clave.',
          tag: 'Eventos',
        },
        {
          title: 'Fondo para proyectos comunitarios',
          description: 'Prioridades de financiamiento para servicio local con seguimiento institucional.',
          tag: 'Financiamiento',
        },
        {
          title: 'Biblioteca editorial y media',
          description: 'Activos para extender el alcance de historias, campañas y testimonios.',
          tag: 'Multimedia',
        },
      ],
    },
  ],
  cta: {
    title: 'Activa recursos para proyectos listos para crecer.',
    description: 'La página de funding organiza las prioridades y los caminos de aporte sin requerir backend dinámico en esta fase.',
    primaryAction: {
      label: 'Ir a funding',
      to: surfacePaths.institutional.projectFunding,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Donar ahora',
      to: surfacePaths.institutional.donate,
      variant: 'secondary',
    },
  },
}
