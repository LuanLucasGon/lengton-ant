export interface Camera {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function zoomAt(
  camera: Camera,
  mouseX: number,
  mouseY: number,
  factor: number,
  minScale: number,
  maxScale: number,
): Camera {
  const newScale = Math.min(maxScale, Math.max(minScale, camera.scale * factor));
  const worldX = (mouseX - camera.offsetX) / camera.scale;
  const worldY = (mouseY - camera.offsetY) / camera.scale;

  return {
    scale: newScale,
    offsetX: mouseX - worldX * newScale,
    offsetY: mouseY - worldY * newScale,
  };
}

export function panBy(camera: Camera, dx: number, dy: number): Camera {
  return {
    scale: camera.scale,
    offsetX: camera.offsetX + dx,
    offsetY: camera.offsetY + dy,
  };
}
