import { expect, test, type Locator } from '@playwright/test'

async function readCarouselSnapshot(locator: Locator) {
  return locator.evaluate((node: HTMLElement) => {
    const viewportRect = node.getBoundingClientRect()
    const cards = Array.from(
      node.querySelectorAll<HTMLElement>('.institutional-home__carousel-loop-card')
    )

    const visibleCards = cards.filter((card) => {
      const rect = card.getBoundingClientRect()
      return (
        rect.right > viewportRect.left &&
        rect.left < viewportRect.right &&
        rect.bottom > viewportRect.top &&
        rect.top < viewportRect.bottom
      )
    })

    const visibleCount = visibleCards.length
    const rightGap =
      visibleCards.length > 0
        ? viewportRect.right -
          Math.max(...visibleCards.map((card) => card.getBoundingClientRect().right))
        : viewportRect.width

    const firstTransform =
      cards[0] ? window.getComputedStyle(cards[0]).transform : 'none'

    return {
      visibleCount,
      firstTransform,
      rightGap,
    }
  })
}

test.describe('institutional editorial carousel', () => {
  test('keeps the viewport visually filled while autoplay advances in webkit', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')

    const viewport = page.getByLabel('Historias destacadas de ASI')
    await expect(viewport).toBeVisible()
    await viewport.scrollIntoViewIfNeeded()

    const start = await readCarouselSnapshot(viewport)
    expect(start.visibleCount).toBeGreaterThan(0)
    expect(start.rightGap).toBeLessThan(40)

    const snapshotCount =
      testInfo.project.name === 'desktop-webkit' ? 4 : 3
    let previous = start

    for (let index = 0; index < snapshotCount; index += 1) {
      await page.waitForTimeout(500)
      const next = await readCarouselSnapshot(viewport)
      expect(next.visibleCount).toBeGreaterThan(0)
      expect(next.rightGap).toBeLessThan(40)
      expect(next.firstTransform).not.toBe(previous.firstTransform)
      previous = next
    }
  })

  test('keeps continuous autoplay on mobile webkit instead of step advances', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-webkit')

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')

    const viewport = page.getByLabel('Historias destacadas de ASI')
    await expect(viewport).toBeVisible()
    await viewport.scrollIntoViewIfNeeded()

    const start = await readCarouselSnapshot(viewport)
    await page.waitForTimeout(700)
    const next = await readCarouselSnapshot(viewport)

    expect(next.visibleCount).toBeGreaterThan(0)
    expect(next.rightGap).toBeLessThan(40)
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
