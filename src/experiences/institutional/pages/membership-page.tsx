import { motion, useReducedMotion } from 'motion/react';

import {
  InstitutionalActionLink,
  InstitutionalCard,
  InstitutionalLead,
  InstitutionalSection,
} from '@/experiences/institutional/components/institutional-ui';
import {
  membershipFeatures,
  membershipHeroImage,
  membershipPageContent,
} from '@/experiences/institutional/content/membership-content';
import { cn } from '@/lib/utils/cn';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 32 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: 0.18,
    },
  },
};

export function MembershipPage() {
  const shouldReduceMotion = useReducedMotion();
  const { hero, sections } = membershipPageContent;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <InstitutionalSection className="overflow-hidden">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left column */}
          <motion.div
            animate="show"
            initial={shouldReduceMotion ? false : 'hidden'}
            variants={containerVariants}
          >
            <motion.p className="asi-kicker" variants={itemVariants}>
              {hero.eyebrow}
            </motion.p>

            <motion.h1
              className="asi-heading-lg mt-4 max-w-[22ch]"
              variants={itemVariants}
            >
              {hero.title}
            </motion.h1>

            <motion.p
              className="asi-copy mt-5 max-w-[58ch] text-[1.02rem]"
              variants={itemVariants}
            >
              {hero.description}
            </motion.p>

            {/* Feature list */}
            <dl className="mt-8 space-y-6">
              {membershipFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.name}
                    className="relative pl-10"
                    variants={itemVariants}
                  >
                    <dt className="inline font-semibold text-(--asi-text)">
                      <Icon
                        aria-hidden="true"
                        className="absolute top-0.5 left-0 size-5 text-(--asi-primary)"
                      />
                      {feature.name}.
                    </dt>{' '}
                    <dd className="inline text-sm leading-7 text-(--asi-text-muted)">
                      {feature.description}
                    </dd>
                  </motion.div>
                );
              })}
            </dl>

            {/* CTAs */}
            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row"
              variants={itemVariants}
            >
              <InstitutionalActionLink action={hero.primaryAction} />
              <InstitutionalActionLink action={hero.secondaryAction} />
            </motion.div>
          </motion.div>

          {/* Right column – image */}
          <motion.div
            animate={shouldReduceMotion ? undefined : 'show'}
            className="relative"
            initial={shouldReduceMotion ? false : 'hidden'}
            variants={shouldReduceMotion ? undefined : imageVariants}
          >
            <img
              alt={membershipHeroImage.alt}
              className="aspect-4/3 w-full rounded-[1.75rem] object-cover shadow-2xl ring-1 ring-black/8 lg:aspect-square lg:max-h-110"
              fetchPriority="high"
              loading="eager"
              src={membershipHeroImage.src}
            />
            {/* Subtle gradient overlay at the bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[1.75rem] bg-linear-to-t from-black/18 to-transparent" />
          </motion.div>
        </div>
      </InstitutionalSection>

      {/* ── Content sections ─────────────────────────────────── */}
      {sections.map((section) => {
        switch (section.type) {
          case 'stats':
            return (
              <InstitutionalSection
                key={section.lead.title}
                tone={section.tone ?? 'plain'}
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
                  <InstitutionalLead
                    content={section.lead}
                    invert={section.tone === 'brand'}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    {section.items.map((item) => (
                      <InstitutionalCard
                        key={item.label}
                        className={
                          section.tone === 'brand'
                            ? 'bg-white/10 text-white backdrop-blur-md'
                            : undefined
                        }
                      >
                        <p
                          className={
                            section.tone === 'brand'
                              ? 'text-4xl font-semibold tracking-tight text-white'
                              : 'text-4xl font-semibold tracking-tight text-(--asi-primary)'
                          }
                        >
                          {item.value}
                        </p>
                        <p
                          className={
                            section.tone === 'brand'
                              ? 'mt-3 text-base font-semibold text-white'
                              : 'mt-3 text-base font-semibold text-(--asi-text)'
                          }
                        >
                          {item.label}
                        </p>
                        <p
                          className={
                            section.tone === 'brand'
                              ? 'mt-2 text-sm leading-6 text-white/78'
                              : 'mt-2 text-sm leading-6 text-(--asi-text-muted)'
                          }
                        >
                          {item.description}
                        </p>
                      </InstitutionalCard>
                    ))}
                  </div>
                </div>
              </InstitutionalSection>
            );

          case 'feature-grid':
            return (
              <InstitutionalSection
                key={section.lead.title}
                tone={section.tone ?? 'plain'}
              >
                <div className="space-y-8">
                  <InstitutionalLead
                    content={section.lead}
                    invert={section.tone === 'brand'}
                  />
                  <div
                    className={cn(
                      section.columns === 4
                        ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-4'
                        : section.columns === 2
                        ? 'grid gap-4 lg:grid-cols-2'
                        : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
                    )}
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <InstitutionalCard
                          key={item.title}
                          className={
                            section.tone === 'brand'
                              ? 'bg-white/10 text-white backdrop-blur-md'
                              : undefined
                          }
                        >
                          {item.image ? (
                            <img
                              alt={item.imageAlt ?? item.title}
                              className="h-44 w-full rounded-2xl object-cover"
                              loading="lazy"
                              src={item.image}
                            />
                          ) : null}
                          {Icon ? (
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-(--asi-surface-raised) text-(--asi-primary)">
                              <Icon className="size-5" />
                            </div>
                          ) : null}
                          <p className="mt-4 text-lg font-semibold tracking-tight text-(--asi-text)">
                            {item.title}
                          </p>
                          <p className="asi-copy mt-2">{item.description}</p>
                          {item.meta ? (
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-(--asi-secondary)">
                              {item.meta}
                            </p>
                          ) : null}
                        </InstitutionalCard>
                      );
                    })}
                  </div>
                </div>
              </InstitutionalSection>
            );

          case 'split':
            return (
              <InstitutionalSection
                key={section.lead.title}
                tone={section.tone ?? 'plain'}
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center">
                  <div>
                    <InstitutionalLead
                      content={section.lead}
                      invert={section.tone === 'brand'}
                    />
                    <div className="mt-6 space-y-4">
                      {section.highlights.map((item) => (
                        <div
                          key={item.title}
                          className={
                            section.tone === 'brand'
                              ? 'rounded-panel bg-white/10 px-5 py-4 backdrop-blur-md'
                              : 'rounded-panel bg-(--asi-surface-panel) px-5 py-4'
                          }
                        >
                          <p
                            className={
                              section.tone === 'brand'
                                ? 'text-sm font-semibold uppercase tracking-[0.14em] text-white/72'
                                : 'text-sm font-semibold uppercase tracking-[0.14em] text-(--asi-secondary)'
                            }
                          >
                            {item.title}
                          </p>
                          <p
                            className={
                              section.tone === 'brand'
                                ? 'mt-2 text-sm leading-6 text-white/82'
                                : 'mt-2 text-sm leading-6 text-(--asi-text-muted)'
                            }
                          >
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-5">
                    <img
                      alt={section.imageAlt}
                      className="h-88 w-full rounded-[1.75rem] object-cover shadow-(--asi-shadow-soft)"
                      loading="lazy"
                      src={section.image}
                    />
                    <InstitutionalCard
                      className={
                        section.tone === 'brand'
                          ? 'bg-white/10 text-white backdrop-blur-md'
                          : undefined
                      }
                    >
                      <p
                        className={
                          section.tone === 'brand'
                            ? 'text-lg font-semibold tracking-tight text-white'
                            : 'text-lg font-semibold tracking-tight text-(--asi-text)'
                        }
                      >
                        {section.bodyTitle}
                      </p>
                      <div className="mt-3 space-y-3">
                        {section.bodyCopy.map((paragraph) => (
                          <p
                            key={paragraph}
                            className={
                              section.tone === 'brand'
                                ? 'text-sm leading-7 text-white/82'
                                : 'text-sm leading-7 text-(--asi-text-muted)'
                            }
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </InstitutionalCard>
                  </div>
                </div>
              </InstitutionalSection>
            );

          case 'list':
            return (
              <InstitutionalSection
                key={section.lead.title}
                tone={section.tone ?? 'plain'}
              >
                <div className="space-y-8">
                  <InstitutionalLead
                    content={section.lead}
                    invert={section.tone === 'brand'}
                  />
                  <div
                    className={
                      section.columns === 2
                        ? 'grid gap-4 xl:grid-cols-2'
                        : 'grid gap-4'
                    }
                  >
                    {section.items.map((item) => (
                      <InstitutionalCard
                        key={`${item.title}-${item.meta ?? ''}`}
                        className="bg-white/82"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold tracking-tight text-(--asi-text)">
                              {item.title}
                            </p>
                            <p className="asi-copy mt-2">{item.description}</p>
                          </div>
                          {item.tag ? (
                            <span className="asi-pill">{item.tag}</span>
                          ) : null}
                        </div>
                        {item.meta ? (
                          <p className="mt-4 text-sm font-medium text-(--asi-secondary)">
                            {item.meta}
                          </p>
                        ) : null}
                      </InstitutionalCard>
                    ))}
                  </div>
                </div>
              </InstitutionalSection>
            );
        }
      })}
    </div>
  );
}
