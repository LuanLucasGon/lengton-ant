import { zoomAt, panBy, Camera } from './camera';

describe('camera', () => {
  describe('zoomAt', () => {
    it('keeps the world point under the cursor fixed on screen', () => {
      const camera: Camera = { scale: 1, offsetX: 50, offsetY: 50 };
      const worldXBefore = (200 - camera.offsetX) / camera.scale;
      const worldYBefore = (150 - camera.offsetY) / camera.scale;

      const result = zoomAt(camera, 200, 150, 1.1, 0.1, 20);

      const worldXAfter = (200 - result.offsetX) / result.scale;
      const worldYAfter = (150 - result.offsetY) / result.scale;
      expect(worldXAfter).toBeCloseTo(worldXBefore);
      expect(worldYAfter).toBeCloseTo(worldYBefore);
    });

    it('multiplies the scale by the given factor', () => {
      const camera: Camera = { scale: 2, offsetX: 0, offsetY: 0 };

      const result = zoomAt(camera, 100, 100, 1.1, 0.1, 20);

      expect(result.scale).toBeCloseTo(2.2);
    });

    it('clamps the scale to the given range', () => {
      const camera: Camera = { scale: 19.5, offsetX: 0, offsetY: 0 };

      const result = zoomAt(camera, 100, 100, 1.1, 0.1, 20);

      expect(result.scale).toBe(20);
    });
  });

  describe('panBy', () => {
    it('moves the offset by the given delta without changing scale', () => {
      const camera: Camera = { scale: 3, offsetX: 10, offsetY: 20 };

      const result = panBy(camera, 5, -8);

      expect(result).toEqual({ scale: 3, offsetX: 15, offsetY: 12 });
    });
  });
});
