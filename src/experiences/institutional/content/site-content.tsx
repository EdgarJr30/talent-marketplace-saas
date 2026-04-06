import type { LucideIcon } from 'lucide-react'
import {
  BadgeHelp,
  BookOpenText,
  BriefcaseBusiness,
  Church,
  CircleDollarSign,
  HandHeart,
  HeartHandshake,
  Megaphone,
  MonitorPlay,
  PhoneCall,
  Sparkles,
  UsersRound
} from 'lucide-react'

import { surfacePaths } from '@/app/router/surface-paths'

export type InstitutionalAction = {
  label: string
  to: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export type InstitutionalLeadContent = {
  eyebrow?: string
  title: string
  description: string
}

export type InstitutionalTone = 'plain' | 'muted' | 'brand'

export type InstitutionalHeroCard = {
  title: string
  description: string
  icon: LucideIcon
  meta?: string
}

export type InstitutionalFeatureItem = {
  title: string
  description: string
  icon?: LucideIcon
  image?: string
  imageAlt?: string
  meta?: string
}

export type InstitutionalMediaSlide = {
  title: string
  description: string
  image: string
  imageAlt: string
  primaryAction: InstitutionalAction
  secondaryAction: InstitutionalAction
  contentMode?: 'default' | 'image-only'
}

export type InstitutionalStat = {
  label: string
  value: string
  description: string
}

export type InstitutionalListItem = {
  title: string
  description: string
  meta?: string
  tag?: string
}

export type InstitutionalPerson = {
  name: string
  role: string
  description: string
  image: string
}

export type InstitutionalSection =
  | {
      type: 'feature-grid'
      tone?: InstitutionalTone
      lead: InstitutionalLeadContent
      items: InstitutionalFeatureItem[]
      columns?: 2 | 3 | 4
    }
  | {
      type: 'stats'
      tone?: InstitutionalTone
      lead: InstitutionalLeadContent
      items: InstitutionalStat[]
    }
  | {
      type: 'split'
      tone?: InstitutionalTone
      lead: InstitutionalLeadContent
      image: string
      imageAlt: string
      bodyTitle: string
      bodyCopy: string[]
      highlights: InstitutionalListItem[]
    }
  | {
      type: 'list'
      tone?: InstitutionalTone
      lead: InstitutionalLeadContent
      items: InstitutionalListItem[]
      columns?: 1 | 2
    }
  | {
      type: 'people'
      tone?: InstitutionalTone
      lead: InstitutionalLeadContent
      items: InstitutionalPerson[]
    }

export type InstitutionalPageContent = {
  hero: InstitutionalLeadContent & {
    primaryAction: InstitutionalAction
    secondaryAction: InstitutionalAction
    aside: InstitutionalHeroCard[]
  }
  sections: InstitutionalSection[]
  cta: {
    title: string
    description: string
    primaryAction: InstitutionalAction
    secondaryAction: InstitutionalAction
  }
}

export const institutionalNavigation = [
  { label: 'Inicio', to: surfacePaths.institutional.home },
  { label: 'Membresía', to: surfacePaths.institutional.membership },
  { label: 'Proyectos', to: surfacePaths.institutional.projects },
  { label: 'Noticias', to: surfacePaths.institutional.news },
  { label: 'Multimedia', to: surfacePaths.institutional.media },
  { label: 'Directorio', to: surfacePaths.institutional.directory },
  { label: 'Contáctanos', to: surfacePaths.institutional.contactUs }
] as const

export const homeHeroMetrics: InstitutionalStat[] = [
  {
    value: '25+',
    label: 'Años de servicio',
    description: 'Construyendo una comunidad profesional orientada por la fe y la misión.'
  },
  {
    value: '300+',
    label: 'Aliados y miembros',
    description: 'Profesionales, empresarios y voluntarios colaborando en una misma red.'
  }
] as const

export const homeHeroSlides: InstitutionalMediaSlide[] = [
  {
    title: 'Convención ASI 2026',
    description: '',
    image: '/media/2026-asi-convention.jpg',
    imageAlt: 'Convención ASI 2026',
    primaryAction: {
      label: 'Únete ahora',
      to: surfacePaths.institutional.membership,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Nuestra misión',
      to: surfacePaths.institutional.whoWeAre,
      variant: 'secondary'
    },
    contentMode: 'image-only'
  },
  {
    title: 'Fe en el mercado, servicio en la misión.',
    description: 'Uniendo a profesionales laicos para servir a la comunidad con integridad, propósito y visión compartida.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Profesionales reunidos en oración y comunidad',
    primaryAction: {
      label: 'Únete ahora',
      to: surfacePaths.institutional.membership,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Nuestra misión',
      to: surfacePaths.institutional.whoWeAre,
      variant: 'secondary'
    }
  },
  {
    title: 'Proyectos que convierten visión en impacto visible.',
    description: 'Financiamos, acompañamos y contamos iniciativas que fortalecen iglesia, comunidad y liderazgo.',
    image:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Voluntariado comunitario empacando donaciones',
    primaryAction: {
      label: 'Explorar proyectos',
      to: surfacePaths.institutional.projects,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Financiamiento',
      to: surfacePaths.institutional.projectFunding,
      variant: 'secondary'
    }
  },
  {
    title: 'Eventos, membresía y comunidad en una sola voz institucional.',
    description: 'Una experiencia editorial diseñada para inspirar, informar y conectar a la red de ASI con elegancia.',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Convención con audiencia levantando las manos',
    primaryAction: {
      label: 'Ver noticias',
      to: surfacePaths.institutional.news,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Ir a multimedia',
      to: surfacePaths.institutional.media,
      variant: 'secondary'
    }
  }
] as const

export const homeCarouselCards: InstitutionalFeatureItem[] = [
  {
    title: 'Testimonio de comunidad',
    description: '"Encontré una red de apoyo real para servir desde mi profesión con mayor claridad y compromiso."',
    meta: 'Marlen Tejeda',
    image:
      'https://images.unsplash.com/photo-1760367120345-2b96c53de838?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    imageAlt: 'Congregación cristiana reunida en oración'
  },
  {
    title: 'Servicio en acción',
    description: 'Jornadas locales donde fe y acción práctica se encuentran para responder a necesidades concretas.',
    image:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Equipo de voluntariado en acción'
  },
  {
    title: 'Mentoría y colaboración',
    description: 'Conversaciones que conectan experiencia, propósito y misión para avanzar acompañados.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Personas conversando en una mesa de trabajo'
  },
  {
    title: 'Liderazgo con integridad',
    description: 'Historias breves que muestran cómo la membresía se traduce en servicio, formación y alcance.',
    meta: 'Historias de fe y servicio',
    image:
      'https://images.unsplash.com/photo-1697218173427-6bd39e9599cc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    imageAlt: 'Grupo cristiano compartiendo un momento de oración'
  },
  {
    title: 'Adoración que une',
    description: 'Celebraciones congregacionales que convierten cada encuentro en una experiencia de fe compartida y esperanza activa.',
    meta: 'Culto y comunidad',
    image:
      'https://images.unsplash.com/photo-1674566114911-cd9b71354d39?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    imageAlt: 'Comunidad cristiana levantando las manos en adoración'
  }
] as const

export const homeEcosystemCards: InstitutionalFeatureItem[] = [
  {
    title: 'Eventos & convenciones',
    description:
      'Espacios donde la adoración, la enseñanza bíblica y la visión misional se comparten con orden, claridad y participación de toda la red.',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Evento con luces cálidas y público'
  },
  {
    title: 'Programas',
    description:
      'Procesos de formación que integran fe, liderazgo y servicio para acompañar decisiones concretas en la vida profesional y familiar.',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Grupo de personas conversando y aprendiendo'
  },
  {
    title: 'Membresía',
    description:
      'Una comunidad de creyentes que se fortalece en oración, acompañamiento y compromiso con una presencia cristiana coherente en la sociedad.',
    image:
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Profesionales compartiendo en un encuentro de comunidad cristiana',
    icon: Church
  },
  {
    title: 'Comunidad',
    description:
      'Relaciones de apoyo mutuo, testimonios y recursos que ayudan a vivir el evangelio con cercanía, unidad y servicio visible.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Comunidad reunida'
  }
] as const

export const homeProgramShowcase: InstitutionalFeatureItem[] = [
  {
    title: 'Líderes de iniciativa',
    description: 'Programas que acompañan visión, carácter y crecimiento organizacional.',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Líder conversando con otra persona'
  },
  {
    title: 'Liderazgo de fe',
    description: 'Conversaciones, cohortes y experiencias para una influencia con integridad.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Reunión de liderazgo'
  },
  {
    title: 'Programas comunitarios',
    description: 'Formación y servicio conectados con necesidades reales de la comunidad.',
    image:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Voluntariado comunitario'
  }
] as const

export const homeTestimonials: InstitutionalListItem[] = [
  {
    title: '"La comunidad me ayudó a ver mi profesión como una extensión de la misión."',
    description: 'Un testimonio de acompañamiento, mentoría y propósito vivido en comunidad.',
    meta: 'Honor Ortega'
  },
  {
    title: '"Encontramos un espacio para servir con orden, visión y gente que camina contigo."',
    description: 'Una historia sobre membresía, relaciones y proyectos con sentido.',
    meta: 'Aura Faña'
  },
  {
    title: '"Cada proyecto deja de sentirse aislado cuando entra en una red que lo sostiene."',
    description: 'ASI como plataforma relacional, no solo informativa.',
    meta: 'Cesia Matos'
  }
] as const

export const homeSpotlights: InstitutionalFeatureItem[] = [
  {
    title: 'Eventos & convenciones',
    description: 'Encuentros que inspiran, forman y conectan a la comunidad profesional con propósito.',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Convención con audiencia levantando las manos'
  },
  {
    title: 'Proyectos de servicio',
    description: 'Iniciativas que traducen visión en servicio concreto para iglesias, familias y comunidades.',
    image:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Voluntarios trabajando en comunidad'
  },
  {
    title: 'Membresía que acompaña',
    description: 'Una red para crecer en integridad, liderazgo, mentoría y colaboración.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Equipo sonriendo en una actividad institucional'
  }
] as const

export const homeActionCards: InstitutionalFeatureItem[] = [
  {
    title: 'Programas',
    description: 'Formación, mentoría y acompañamiento para servir con excelencia.',
    icon: BookOpenText,
    meta: 'Crecimiento integral'
  },
  {
    title: 'Membresía',
    description: 'Conexiones duraderas entre líderes, empresarios y profesionales.',
    icon: UsersRound,
    meta: 'Comunidad de fe'
  },
  {
    title: 'Comunidad',
    description: 'Espacios para colaborar, compartir recursos y activar servicio.',
    icon: HeartHandshake,
    meta: 'Cuidado mutuo'
  },
  {
    title: 'Proyectos',
    description: 'Iniciativas que transforman necesidades concretas en impacto visible.',
    icon: HandHeart,
    meta: 'Servicio práctico'
  }
] as const

export const homeMissionCards: InstitutionalFeatureItem[] = [
  {
    title: 'Liderazgo con propósito',
    description: 'Curamos conversaciones, recursos y acompañamiento para que el liderazgo se traduzca en servicio.',
    icon: Sparkles
  },
  {
    title: 'Puentes entre iglesia y profesión',
    description: 'ASI fortalece el lugar donde fe, vocación y misión dejan de competir y empiezan a colaborar.',
    icon: Church
  },
  {
    title: 'Visibilidad institucional',
    description: 'Mostramos proyectos, testimonios y oportunidades con una presencia clara y confiable.',
    icon: Megaphone
  }
] as const

export const homePreviewCards: InstitutionalListItem[] = [
  {
    title: 'Nuevas alianzas para proyectos de servicio',
    description: 'Una actualización editorial sobre iniciativas que ya están movilizando recursos y voluntariado.',
    meta: 'Noticias'
  },
  {
    title: 'Biblioteca media para convenciones y campañas',
    description: 'Videos, galerías y piezas reutilizables para mantener la conversación viva.',
    meta: 'Multimedia'
  },
  {
    title: 'Directorio institucional por regiones y frentes',
    description: 'Encuentra líderes, equipos y puntos de contacto desde un hub ordenado y fácil de recorrer.',
    meta: 'Directorio'
  }
] as const

export const contactPoints: InstitutionalFeatureItem[] = [
  {
    title: 'Secretaría general',
    description: 'Canal principal para orientación institucional, agenda y solicitudes generales.',
    icon: PhoneCall,
    meta: 'secretaria@asirdo.org · +1 809 555 0140'
  },
  {
    title: 'Membresía',
    description: 'Acompañamiento para ingreso, activación y comunidad de miembros.',
    icon: UsersRound,
    meta: 'membership@asirdo.org'
  },
  {
    title: 'Proyectos y financiamiento',
    description: 'Conversaciones sobre proyectos, alianzas y oportunidades de patrocinio.',
    icon: CircleDollarSign,
    meta: 'projects@asirdo.org'
  },
  {
    title: 'Multimedia y comunicaciones',
    description: 'Solicitudes editoriales, cobertura, materiales y uso de marca.',
    icon: MonitorPlay,
    meta: 'media@asirdo.org'
  }
] as const

export const platformBridgeCards: InstitutionalFeatureItem[] = [
  {
    title: 'Plataforma ASI',
    description: 'La experiencia SaaS del proyecto vive aparte en una superficie propia para jobs, auth y app.',
    icon: BriefcaseBusiness,
    meta: 'Rutas bajo /platform'
  },
  {
    title: 'Separación clara',
    description: 'El portal institucional y la plataforma comercial comparten marca, pero no el mismo shell visual.',
    icon: BadgeHelp,
    meta: 'Dos superficies enlazadas'
  }
] as const
