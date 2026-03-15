import { describe, expect, it, vi } from 'vitest'

import { exportApplicationsCsv } from '@/features/applications/lib/applications-api'

describe('exportApplicationsCsv', () => {
  it('creates a csv download with the expected columns and stage names', () => {
    const click = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      href: '',
      download: ''
    } as unknown as HTMLAnchorElement)
    const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

    exportApplicationsCsv(
      [
        {
          candidate_display_name_snapshot: 'Edgar Perez',
          candidate_email_snapshot: 'edgar@example.com',
          current_stage_id: 'stage-1',
          submitted_at: '2026-03-15T12:00:00Z',
          status_public: 'in_review',
          job_posting: {
            title: 'Electrical Engineer'
          },
          candidate_profile: {
            desired_role: 'Electrical Engineer'
          }
        }
      ],
      {
        'stage-1': 'Phone Screen'
      }
    )

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(urlSpy).toHaveBeenCalled()
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeSpy).toHaveBeenCalledWith('blob:test-url')
  })
})
