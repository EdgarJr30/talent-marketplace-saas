import { z } from 'zod'

export const jobPostingSchema = z
  .object({
    title: z.string().trim().min(3, 'Usa un titulo de al menos 3 caracteres.').max(120),
    slug: z
      .string()
      .trim()
      .min(3, 'Usa un slug de al menos 3 caracteres.')
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa solo minusculas, numeros y guiones.'),
    summary: z.string().trim().min(24, 'Resume la vacante en al menos 24 caracteres.').max(320),
    description: z.string().trim().min(80, 'Describe la vacante con al menos 80 caracteres.').max(5000),
    workplaceType: z.enum(['on_site', 'hybrid', 'remote']),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'internship']),
    cityName: z.string().trim().max(120).optional().or(z.literal('')),
    countryCode: z.string().trim().max(2).optional().or(z.literal('')),
    salaryVisible: z.boolean(),
    salaryMinAmount: z.string().trim().optional().or(z.literal('')),
    salaryMaxAmount: z.string().trim().optional().or(z.literal('')),
    salaryCurrency: z.string().trim().max(3).optional().or(z.literal('')),
    experienceLevel: z.string().trim().max(80).optional().or(z.literal('')),
    expiresAt: z.string().trim().optional().or(z.literal(''))
  })
  .superRefine((values, context) => {
    const minAmount = values.salaryMinAmount ? Number(values.salaryMinAmount) : null
    const maxAmount = values.salaryMaxAmount ? Number(values.salaryMaxAmount) : null

    if (values.salaryVisible) {
      if (minAmount !== null && Number.isNaN(minAmount)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salaryMinAmount'],
          message: 'El salario minimo debe ser numerico.'
        })
      }

      if (maxAmount !== null && Number.isNaN(maxAmount)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salaryMaxAmount'],
          message: 'El salario maximo debe ser numerico.'
        })
      }

      if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salaryMaxAmount'],
          message: 'El salario maximo debe ser mayor o igual al minimo.'
        })
      }
    }
  })

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>

export interface JobScreeningQuestionDraft {
  id: string
  questionText: string
  answerType: 'short_text' | 'long_text' | 'yes_no' | 'single_select'
  helperText: string
  optionList: string
  isRequired: boolean
}

export function createEmptyScreeningQuestion(): JobScreeningQuestionDraft {
  return {
    id: crypto.randomUUID(),
    questionText: '',
    answerType: 'short_text',
    helperText: '',
    optionList: '',
    isRequired: false
  }
}

export function sanitizeScreeningQuestions(items: JobScreeningQuestionDraft[]) {
  return items
    .map((item) => ({
      ...item,
      questionText: item.questionText.trim(),
      helperText: item.helperText.trim(),
      optionList: item.optionList
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean)
    }))
    .filter((item) => item.questionText)
}

export function toJobSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}
