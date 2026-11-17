import { spectrumColor } from './spectrum';

const hueOf = (color: string) => Number(color.match(/hsl\((\d+(?:\.\d+)?)/)![1]);

describe('spectrumColor', () => {
  it('starts at the low-frequency end of the spectrum (red)', () => {
    expect(spectrumColor(0)).toBe('hsl(0, 85%, 55%)');
  });

  it('moves toward the high-frequency end as the order increases', () => {
    const low = spectrumColor(1);
    const high = spectrumColor(1000);

    expect(hueOf(high)).toBeGreaterThan(hueOf(low));
  });

  it('covers a wide slice of the spectrum, not just one or two colors', () => {
    const hues = Array.from({ length: 1200 }, (_, order) => hueOf(spectrumColor(order)));

    expect(Math.max(...hues)).toBeGreaterThanOrEqual(250);
  });

  it('changes gradually between neighboring orders instead of jumping abruptly', () => {
    for (let order = 0; order < 50; order++) {
      const step = Math.abs(hueOf(spectrumColor(order + 1)) - hueOf(spectrumColor(order)));
      expect(step).toBeLessThanOrEqual(1);
    }
  });

  it('cycles back to red only after many cells, so nearby cells stay close in hue', () => {
    const afterOneFullCycle = spectrumColor(1200);

    expect(afterOneFullCycle).toBe(spectrumColor(0));
  });
});
