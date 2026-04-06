import { BookOpenText, Building2, HandHeart, HeartHandshake, Newspaper, UsersRound } from 'lucide-react'

import { surfacePaths } from '@/app/router/surface-paths'
import type { InstitutionalPageContent } from '@/experiences/institutional/content/site-content'

export const membershipFeatures = [
  {
    name: 'Comunidad activa',
    description: 'Capítulos locales, eventos, mentoría y colaboración entre pares.',
    icon: UsersRound,
  },
  {
    name: 'Formación continua',
    description: 'Recursos y encuentros que fortalecen liderazgo, misión y servicio.',
    icon: BookOpenText,
  },
  {
    name: 'Conexiones con propósito',
    description: 'Relaciones que ayudan a movilizar ideas, talento y generosidad.',
    icon: HeartHandshake,
  },
] as const

export const membershipHeroImage = {
  src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2400&q=80',
  alt: 'Hermanos cristianos unidos en comunidad y servicio',
}

export const membershipPageContent: InstitutionalPageContent = {
  hero: {
    eyebrow: 'Membresía',
    title: 'Una membresía pensada para acompañar vocación, liderazgo y servicio.',
    description:
      'ASI reúne profesionales y empresarios en una red que comparte recursos, mentoría, formación y oportunidades de impacto con una identidad institucional clara.',
    primaryAction: {
      label: 'Solicitar membresía',
      to: surfacePaths.institutional.contactUs,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Renovar membresía',
      to: surfacePaths.institutional.contactUs,
      variant: 'secondary',
    },
    aside: [
      {
        title: 'Comunidad activa',
        description: 'Capítulos locales, eventos, mentoría y colaboración entre pares.',
        icon: UsersRound,
      },
      {
        title: 'Formación continua',
        description: 'Recursos y encuentros que fortalecen liderazgo, misión y servicio.',
        icon: BookOpenText,
      },
      {
        title: 'Conexiones con propósito',
        description: 'Relaciones que ayudan a movilizar ideas, talento y generosidad.',
        icon: HeartHandshake,
      },
    ],
  },
  sections: [
    {
      type: 'stats',
      tone: 'muted',
      lead: {
        eyebrow: 'Valor',
        title: 'Lo que la membresía hace posible.',
        description: 'La propuesta de valor se organiza como acompañamiento relacional, formación y movilización.',
      },
      items: [
        {
          value: '4',
          label: 'Pilares',
          description: 'Comunidad, mentoría, recursos y servicio.',
        },
        {
          value: '12',
          label: 'Momentos al año',
          description: 'Entre eventos, encuentros, briefings y espacios de coordinación.',
        },
        {
          value: '1 red',
          label: 'Identidad compartida',
          description: 'Una sola voz institucional para contar misión, impacto y colaboración.',
        },
      ],
    },
    {
      type: 'feature-grid',
      lead: {
        eyebrow: 'Beneficios',
        title: 'Qué recibe una persona o familia miembro.',
        description: 'La experiencia debe sentirse útil desde la primera interacción y sostenible en el tiempo.',
      },
      items: [
        {
          title: 'Mentoría y cercanía',
          description: 'Acompañamiento práctico con líderes y pares que entienden la realidad profesional.',
          icon: HeartHandshake,
        },
        {
          title: 'Programas editoriales',
          description: 'Acceso a recursos, guías, eventos y conversaciones curadas con intención institucional.',
          icon: Newspaper,
        },
        {
          title: 'Oportunidades de servicio',
          description: 'Proyectos concretos donde la membresía puede aportar tiempo, experiencia o financiamiento.',
          icon: HandHeart,
        },
        {
          title: 'Red de colaboración',
          description: 'Vínculos con capítulos, equipos y aliados que multiplican el alcance de cada iniciativa.',
          icon: Building2,
        },
      ],
      columns: 2,
    },
    {
      type: 'split',
      tone: 'brand',
      lead: {
        eyebrow: 'Proceso',
        title: 'Una incorporación clara, humana y gradual.',
        description: 'La membresía se presenta como una relación, no como una transacción aislada.',
      },
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Miembros en un evento institucional',
      bodyTitle: 'Cómo se vive el ingreso',
      bodyCopy: [
        'El proceso combina orientación, presentación institucional y conexión con frentes de participación relevantes.',
        'La experiencia inicial debe dejar claro dónde está la comunidad, qué recursos existen y cómo empezar a servir desde el contexto real de cada miembro.',
      ],
      highlights: [
        {
          title: 'Paso 1',
          description: 'Contacto inicial y conversación de contexto.',
        },
        {
          title: 'Paso 2',
          description: 'Integración a comunidad, calendario y recursos clave.',
        },
        {
          title: 'Paso 3',
          description: 'Activación en proyectos, mentoría o frentes de colaboración.',
        },
      ],
    },
    {
      type: 'list',
      tone: 'muted',
      lead: {
        eyebrow: 'Perfiles',
        title: 'Frentes donde la membresía encuentra su lugar.',
        description: 'No todos participan igual; la web debe comunicar opciones con claridad.',
      },
      columns: 2,
      items: [
        {
          title: 'Profesionales activos',
          description: 'Personas que desean integrar vocación, testimonio y servicio desde su ejercicio profesional.',
          tag: 'Vocación',
        },
        {
          title: 'Empresarios y patrocinadores',
          description: 'Aliados que movilizan redes, recursos y oportunidades con visión de misión.',
          tag: 'Mayordomía',
        },
        {
          title: 'Familias y voluntariado',
          description: 'Núcleos que se suman a proyectos, eventos y dinámicas de comunidad.',
          tag: 'Comunidad',
        },
        {
          title: 'Liderazgo regional',
          description: 'Equipos que articulan capítulos y mantienen viva la identidad institucional.',
          tag: 'Coordinación',
        },
      ],
    },
  ],
  cta: {
    title: 'Da el próximo paso hacia una membresía con propósito.',
    description: 'La primera versión puede iniciar con un contacto guiado, mientras el flujo completo evoluciona más adelante.',
    primaryAction: {
      label: 'Hablar con ASI',
      to: surfacePaths.institutional.contactUs,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Explorar la plataforma',
      to: surfacePaths.public.home,
      variant: 'secondary',
    },
  },
}
