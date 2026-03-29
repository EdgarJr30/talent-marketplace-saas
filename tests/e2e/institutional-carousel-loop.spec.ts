import { expect, test, type Locator } from '@playwright/test'

async function readCarouselSnapshot(locator: Locator) {
  return locator.evaluate((node: HTMLElement) => {
    const viewportRect = node.getBoundingClientRect()
    const cards = Array.from(
      node.querySelectorAll<HTMLElement>('.institutional-home__carousel-loop-card')
    )

    const visibleCount = cards.filter((card) => {
      const rect = card.getBoundingClientRect()
      return (
        rect.right > viewportRect.left &&
        rect.left < viewportRect.right &&
        rect.bottom > viewportRect.top &&
        rect.top < viewportRect.bottom
      )
    }).length

    const firstTransform =
      cards[0] ? window.getComputedStyle(cards[0]).transform : 'none'

    return {
      visibleCount,
      firstTransform,
    }
  })
}

test.describe('institutional editorial carousel', () => {
  test('keeps visible cards while autoplay advances in webkit and mobile fallbacks', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')

    const viewport = page.getByLabel('Historias destacadas de ASI')
    await expect(viewport).toBeVisible()
    await viewport.scrollIntoViewIfNeeded()

    const start = await readCarouselSnapshot(viewport)
    expect(start.visibleCount).toBeGreaterThan(0)

    const autoplayWaitMs =
      testInfo.project.name === 'mobile-webkit' ? 4200 : 1500

    await page.waitForTimeout(autoplayWaitMs)

    const next = await readCarouselSnapshot(viewport)
    expect(next.visibleCount).toBeGreaterThan(0)
    expect(next.firstTransform).not.toBe(start.firstTransform)
  })

  test('accepts horizontal wheel input on desktop webkit without requiring drag', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-webkit')

    await page.goto('/')

    const viewport = page.getByLabel('Historias destacadas de ASI')
    await expect(viewport).toBeVisible()
    await viewport.scrollIntoViewIfNeeded()
    await viewport.hover()

    const start = await readCarouselSnapshot(viewport)
    expect(start.visibleCount).toBeGreaterThan(0)

    await page.mouse.wheel(480, 0)
    await page.waitForTimeout(160)

    const next = await readCarouselSnapshot(viewport)
    expect(next.visibleCount).toBeGreaterThan(0)
    expect(next.firstTransform).not.toBe(start.firstTransform)
  })
})
