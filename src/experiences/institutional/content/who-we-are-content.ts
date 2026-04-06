import { Church, Globe2, HeartHandshake, Landmark, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'

import { surfacePaths } from '@/app/router/surface-paths'
import type { InstitutionalPageContent } from '@/experiences/institutional/content/site-content'

export const whoWeArePageContent: InstitutionalPageContent = {
  hero: {
    eyebrow: 'Quiénes somos',
    title: 'Una asociación que curaría mejor su identidad, historia y propósito en la web.',
    description:
      'La sección institucional debe afirmar misión, trayectoria y liderazgo con una mezcla de autoridad, cercanía y dirección editorial.',
    primaryAction: {
      label: 'Conocer proyectos',
      to: surfacePaths.institutional.projects,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Ver directorio',
      to: surfacePaths.institutional.directory,
      variant: 'secondary',
    },
    aside: [
      {
        title: 'Misión clara',
        description: 'Fe, vocación y servicio articulados sin ambigüedad.',
        icon: Church,
      },
      {
        title: 'Historia viva',
        description: 'Trayectoria que se cuenta con sobriedad y sentido contemporáneo.',
        icon: Landmark,
      },
      {
        title: 'Liderazgo visible',
        description: 'Personas, equipos y frentes presentados con orden.',
        icon: UsersRound,
      },
    ],
  },
  sections: [
    {
      type: 'split',
      tone: 'muted',
      lead: {
        eyebrow: 'Historia',
        title: 'La institución necesita una narrativa que conecte pasado, presente y dirección.',
        description: 'La página no debe limitarse a una biografía larga; debe ayudar a entender por qué ASI existe hoy.',
      },
      image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Reunión institucional alrededor de una mesa',
      bodyTitle: 'Una trayectoria que da contexto',
      bodyCopy: [
        'La historia institucional se presenta como continuidad de servicio, liderazgo y comunidad, no solo como cronología.',
        'La web debe permitir que una persona nueva entienda rápidamente la identidad de ASI y que una persona cercana la reconozca sin verla genérica.',
      ],
      highlights: [
        {
          title: 'Fe en el mercado',
          description: 'Vocación profesional conectada con misión.',
        },
        {
          title: 'Servicio visible',
          description: 'Impacto que no se queda en discurso.',
        },
        {
          title: 'Comunidad organizada',
          description: 'Relaciones sostenidas por estructura y propósito.',
        },
      ],
    },
    {
      type: 'feature-grid',
      lead: {
        eyebrow: 'Principios',
        title: 'Valores que deben sentirse también en el diseño.',
        description: 'La identidad visual propuesta necesita reflejar estos principios de forma consistente.',
      },
      items: [
        {
          title: 'Integridad',
          description: 'Decisiones, lenguaje y acciones alineadas con fe y transparencia.',
          icon: ShieldCheck,
        },
        {
          title: 'Excelencia',
          description: 'Una experiencia cuidada, curada y útil en cada punto de contacto.',
          icon: Sparkles,
        },
        {
          title: 'Comunidad',
          description: 'Pertenencia, colaboración y cuidado mutuo como estructuras reales.',
          icon: HeartHandshake,
        },
        {
          title: 'Misión',
          description: 'Toda iniciativa debe seguir apuntando hacia servicio y testimonio.',
          icon: Globe2,
        },
      ],
      columns: 2,
    },
    {
      type: 'people',
      tone: 'muted',
      lead: {
        eyebrow: 'Leadership',
        title: 'Liderazgo presentado como comunidad de servicio.',
        description: 'No se trata de llenar la página de perfiles, sino de dar referencias claras y confiables.',
      },
      items: [
        {
          name: 'Pastor Daniel Rosario',
          role: 'Presidencia',
          description: 'Dirección general, visión institucional y acompañamiento de frentes estratégicos.',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
        },
        {
          name: 'Martha Almonte',
          role: 'Coordinación de membresía',
          description: 'Relación con capítulos, acompañamiento a miembros y activación de comunidad.',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
        },
        {
          name: 'Samuel Peña',
          role: 'Proyectos y alianzas',
          description: 'Seguimiento de prioridades, patrocinios y relaciones de impacto.',
          image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
        },
      ],
    },
  ],
  cta: {
    title: 'Conoce la institución y luego decide cómo quieres participar.',
    description: 'La relación entre misión, membresía, proyectos y donación debe sentirse natural desde aquí.',
    primaryAction: {
      label: 'Explorar membership',
      to: surfacePaths.institutional.membership,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Ir a contact us',
      to: surfacePaths.institutional.contactUs,
      variant: 'secondary',
    },
  },
}
