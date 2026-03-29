import { describe, expect, it } from 'vitest';

import {
  getTouchPanIntent,
  normalizeCarouselMotionProgress,
} from '@/features/institutional/lib/carousel-gesture';

describe('getTouchPanIntent', () => {
  it('keeps small movements unlocked', () => {
    expect(getTouchPanIntent({ x: 6, y: 8 })).toBe('undetermined');
  });

  it('detects clear horizontal swipes', () => {
    expect(getTouchPanIntent({ x: 42, y: 12 })).toBe('horizontal');
    expect(getTouchPanIntent({ x: -38, y: 10 })).toBe('horizontal');
  });

  it('detects clear vertical scroll gestures', () => {
    expect(getTouchPanIntent({ x: 10, y: 40 })).toBe('vertical');
    expect(getTouchPanIntent({ x: -8, y: -34 })).toBe('vertical');
  });
});

describe('normalizeCarouselMotionProgress', () => {
  it('wraps offsets that drift past the loop end', () => {
    expect(normalizeCarouselMotionProgress(-1320, 600)).toBe(-120);
  });

  it('wraps offsets that drift past the loop start', () => {
    expect(normalizeCarouselMotionProgress(80, 600)).toBe(-520);
  });

  it('leaves valid loop offsets untouched', () => {
    expect(normalizeCarouselMotionProgress(-320, 600)).toBe(-320);
  });
});
