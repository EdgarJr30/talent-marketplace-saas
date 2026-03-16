import { expect, test } from '@playwright/test'

const hasLiveAuth = Boolean(process.env.E2E_SIGNUP_EMAIL && process.env.E2E_SIGNUP_PASSWORD)

test.describe('public shell smoke', () => {
  test('loads the public home and jobs discovery on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /jobs/i })).toBeVisible()

    await page.goto('/jobs')
    await expect(page.getByText(/Descubre oportunidades con una experiencia clara y directa|Gestiona tus vacantes/i)).toBeVisible()
  })
})

if (hasLiveAuth) {
  test.describe('mvp authenticated smoke', () => {
    test('covers auth callback shell, onboarding, recruiter request, applications, and pipeline surfaces', async ({
      page
    }) => {
      await page.goto('/auth')
      await expect(page.getByText('Crea tu usuario base')).toBeVisible()

      await page.goto('/auth/confirm?next=%2Fonboarding')
      await expect(page.getByText(/confirmacion|callback/i)).toBeVisible()

      await page.goto('/onboarding')
      await expect(page.getByText(/Completa tu perfil base|Standard onboarding/i)).toBeVisible()

      await page.goto('/recruiter-request')
      await expect(page.getByText(/Solicitud recruiter|validacion/i)).toBeVisible()

      await page.goto('/applications')
      await expect(page.getByText(/Revisa tu avance|Applications/i)).toBeVisible()

      await page.goto('/pipeline')
      await expect(page.getByText(/Pipeline|applicants/i)).toBeVisible()
    })
  })
} else {
  test.describe.skip('mvp authenticated smoke', () => {
  test('covers auth callback shell, onboarding, recruiter request, applications, and pipeline surfaces', async ({
    page
  }) => {
    await page.goto('/auth')
    await expect(page.getByText('Crea tu usuario base')).toBeVisible()

    await page.goto('/auth/confirm?next=%2Fonboarding')
    await expect(page.getByText(/confirmacion|callback/i)).toBeVisible()

    await page.goto('/onboarding')
    await expect(page.getByText(/Completa tu perfil base|Standard onboarding/i)).toBeVisible()

    await page.goto('/recruiter-request')
    await expect(page.getByText(/Solicitud recruiter|validacion/i)).toBeVisible()

    await page.goto('/applications')
    await expect(page.getByText(/Revisa tu avance|Applications/i)).toBeVisible()

    await page.goto('/pipeline')
    await expect(page.getByText(/Pipeline|applicants/i)).toBeVisible()
  })
  })
}
