import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';

export interface PixelSprite {
  width: number;
  height: number;
  data: number[]; // Array de píxeles (0-255 RGBA)
}

@Injectable({
  providedIn: 'root'
})
export class PixelRendererService {
  private readonly SPRITE_SIZE = 32; // 32x32 píxeles
  private readonly SCALE = 4; // Escalar a 128x128 en pantalla

  /**
   * Generar sprite del pet basado en species y stage
   */
  generatePetSprite(pet: Pet): PixelSprite {
    const spriteData = this.getSpeciesSprite(pet.species, pet.stage);
    return spriteData;
  }

  /**
   * Obtener sprite según especie y stage
   */
  private getSpeciesSprite(species: string, stage: Pet['stage']): PixelSprite {
    switch (species) {
      case 'cat':
        return this.getCatSprite(stage);
      case 'dog':
        return this.getDogSprite(stage);
      case 'dragon':
        return this.getDragonSprite(stage);
      default:
        return this.getGenericSprite(stage);
    }
  }

  /**
   * Sprite genérico (bola redonda)
   */
  private getGenericSprite(stage: Pet['stage']): PixelSprite {
    const size = this.SPRITE_SIZE;
    const data = new Array(size * size * 4).fill(0);

    const color = this.getStageColor(stage);

    // Dibujar círculo simple
    const cx = size / 2;
    const cy = size / 2;
    const radius = stage === 'egg' ? 10 : stage === 'baby' ? 12 : stage === 'teen' ? 14 : 15;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist <= radius) {
          const idx = (y * size + x) * 4;
          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = 255;
        }
      }
    }

    return { width: size, height: size, data };
  }

  /**
   * Sprite de gato
   */
  private getCatSprite(stage: Pet['stage']): PixelSprite {
    const size = this.SPRITE_SIZE;
    const data = new Array(size * size * 4).fill(0);
    const color = this.getStageColor(stage);

    // Cuerpo
    this.drawFilledRect(data, size, 8, 14, 16, 10, color);

    // Cabeza
    this.drawFilledRect(data, size, 10, 6, 12, 10, color);

    // Orejas
    this.drawFilledRect(data, size, 10, 3, 3, 4, color);
    this.drawFilledRect(data, size, 19, 3, 3, 4, color);

    // Ojos
    this.drawPixel(data, size, 12, 8, { r: 0, g: 0, b: 0, a: 255 });
    this.drawPixel(data, size, 20, 8, { r: 0, g: 0, b: 0, a: 255 });

    // Cola
    this.drawLine(data, size, 18, 18, 22, 12, color);

    return { width: size, height: size, data };
  }

  /**
   * Sprite de perro
   */
  private getDogSprite(stage: Pet['stage']): PixelSprite {
    const size = this.SPRITE_SIZE;
    const data = new Array(size * size * 4).fill(0);
    const color = this.getStageColor(stage);

    // Cuerpo
    this.drawFilledRect(data, size, 6, 14, 20, 12, color);

    // Cabeza
    this.drawFilledRect(data, size, 10, 8, 12, 10, color);

    // Orejas colgantes
    this.drawFilledRect(data, size, 8, 8, 3, 8, color);
    this.drawFilledRect(data, size, 23, 8, 3, 8, color);

    // Ojos
    this.drawPixel(data, size, 13, 10, { r: 0, g: 0, b: 0, a: 255 });
    this.drawPixel(data, size, 19, 10, { r: 0, g: 0, b: 0, a: 255 });

    // Nariz
    this.drawPixel(data, size, 16, 12, { r: 0, g: 0, b: 0, a: 255 });

    // Cola
    this.drawLine(data, size, 22, 20, 26, 16, color);

    return { width: size, height: size, data };
  }

  /**
   * Sprite de dragón
   */
  private getDragonSprite(stage: Pet['stage']): PixelSprite {
    const size = this.SPRITE_SIZE;
    const data = new Array(size * size * 4).fill(0);
    const color = { r: 200, g: 50, b: 200, a: 255 }; // Púrpura retro

    // Cuerpo
    this.drawFilledRect(data, size, 8, 16, 16, 10, color);

    // Cabeza
    this.drawFilledRect(data, size, 12, 8, 10, 10, color);

    // Cuernos
    this.drawPixel(data, size, 14, 6, color);
    this.drawPixel(data, size, 20, 6, color);

    // Ojos brillantes
    this.drawPixel(data, size, 14, 10, { r: 255, g: 255, b: 0, a: 255 });
    this.drawPixel(data, size, 18, 10, { r: 255, g: 255, b: 0, a: 255 });

    // Cola
    this.drawLine(data, size, 20, 20, 26, 12, color);
    this.drawLine(data, size, 26, 12, 28, 18, color);

    // Alas
    this.drawFilledRect(data, size, 4, 14, 3, 6, color);
    this.drawFilledRect(data, size, 27, 14, 3, 6, color);

    return { width: size, height: size, data };
  }

  /**
   * Dibujar píxel individual
   */
  private drawPixel(
    data: number[],
    size: number,
    x: number,
    y: number,
    color: { r: number; g: number; b: number; a: number }
  ) {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      data[idx] = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
      data[idx + 3] = color.a;
    }
  }

  /**
   * Dibujar rectángulo relleno
   */
  private drawFilledRect(
    data: number[],
    size: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: { r: number; g: number; b: number; a: number }
  ) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.drawPixel(data, size, x + dx, y + dy, color);
      }
    }
  }

  /**
   * Dibujar línea (Bresenham)
   */
  private drawLine(
    data: number[],
    size: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: { r: number; g: number; b: number; a: number }
  ) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      this.drawPixel(data, size, x, y, color);

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Obtener color basado en stage
   */
  private getStageColor(stage: Pet['stage']): { r: number; g: number; b: number; a: number } {
    switch (stage) {
      case 'egg':
        return { r: 255, g: 200, b: 100, a: 255 }; // Naranja suave
      case 'baby':
        return { r: 100, g: 200, b: 255, a: 255 }; // Azul bebé
      case 'teen':
        return { r: 150, g: 200, b: 100, a: 255 }; // Verde
      case 'adult':
        return { r: 200, g: 100, b: 100, a: 255 }; // Rojo adulto
    }
  }

  /**
   * Renderizar sprite a canvas
   */
  renderToCanvas(
    canvas: HTMLCanvasElement,
    sprite: PixelSprite,
    scale: number = this.SCALE
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = sprite.width * scale;
    canvas.height = sprite.height * scale;

    const imageData = ctx.createImageData(sprite.width, sprite.height);
    imageData.data.set(sprite.data);

    ctx.putImageData(imageData, 0, 0);

    // Escalar sin suavizado (pixel art style)
    ctx.imageSmoothingEnabled = false;
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = sprite.width * scale;
    scaledCanvas.height = sprite.height * scale;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (scaledCtx) {
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(
        canvas,
        0, 0, sprite.width, sprite.height,
        0, 0, sprite.width * scale, sprite.height * scale
      );
    }
  }

  /**
   * Obtener animaciones (cambiar sprite según acción)
   */
  getAnimationFrames(pet: Pet, action: string): PixelSprite[] {
    // Para esta versión, devolvemos el sprite estático
    // En fase 6 implementaremos animaciones más complejas
    return [this.generatePetSprite(pet)];
  }
}
