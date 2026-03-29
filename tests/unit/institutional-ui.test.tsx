import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { InstitutionalSection } from '@/features/institutional/components/institutional-ui'

describe('InstitutionalSection', () => {
  it('supports transparent surfaces and zero spacing without important modifiers', () => {
    const { container } = render(
      <InstitutionalSection spacing="none" tone="transparent">
        <div>Contenido</div>
      </InstitutionalSection>
    )

    const section = container.querySelector('section')

    expect(section).not.toBeNull()
    expect(section?.className).toContain('asi-section-none')
    expect(section?.className).toContain('asi-section-transparent')
    expect(section?.className).not.toContain('!')
  })
})
