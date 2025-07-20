import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';

// Symbol textures available
const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

// Layout & spin tuning constants
const SYMBOL_WIDTH = 140;
const SYMBOL_HEIGHT = 140;
const SYMBOL_GAP = 10;
const SYMBOL_STRIDE = SYMBOL_WIDTH + SYMBOL_GAP;
const DEFAULT_SYMBOL_COUNT = 6;

const LEFT_BOUNDARY = -SYMBOL_STRIDE;
const STOP_SPEED_THRESHOLD = 0.8;
const SNAP_TOLERANCE = 2;
const SNAP_EASING = 0.4;

export type ReelState = 'idle' | 'spinning';

export interface ReelOptions {
  symbolCount?: number;
  rng?: () => number;
  x?: number;
  y?: number;
}

export class Reel extends PIXI.Container {
  private symbols: PIXI.Sprite[] = [];
  private state: ReelState = 'idle';
  private rng: () => number;
  private symbolCount: number;

  // Spin parameters
  private speed = 0;            // current pixels/frame
  private targetSpeed = 0;      // desired speed (for acceleration/deceleration)
  private maxSpeed = 50;        // configurable top speed
  private acceleration = 4;     // accelerate per frame until target
  private decelRate = 0.92;     // slowdown multiplier when decelerating (will use)
  private snapping = false;     // indicates snapping phase (next commit)

  constructor(opts: ReelOptions = {}) {
    super();
    this.rng = opts.rng ?? Math.random;
    this.symbolCount = opts.symbolCount ?? DEFAULT_SYMBOL_COUNT;

    if (opts.x !== undefined) this.x = opts.x;
    if (opts.y !== undefined) this.y = opts.y;

    this.buildInitialSymbols();
  }

  /**
   * Build the initial line of symbols horizontally.
   */
  private buildInitialSymbols(): void {
    for (let i = 0; i < this.symbolCount; i++) {
      const texture = this.getRandomTexture();
      const sprite = new PIXI.Sprite(texture);
      (sprite as any).__name = (texture as any).name || (texture as any).textureCacheIds?.[0];
      sprite.x = i * SYMBOL_STRIDE;
      sprite.y = 0;
      sprite.width = SYMBOL_WIDTH;
      sprite.height = SYMBOL_HEIGHT;
      this.symbols.push(sprite);
      this.addChild(sprite);
    }
  }

  /**
   * Random texture using injectable RNG.
   */
  private getRandomTexture(): PIXI.Texture {
    const index = Math.floor(this.rng() * SYMBOL_TEXTURES.length);
    const name = SYMBOL_TEXTURES[index];
    return AssetLoader.getTexture(name);
  }

  private recycleIfNeeded(): void {
    for (const sprite of this.symbols) {
      if (sprite.x + SYMBOL_WIDTH < 0) {
        const rightmost = Math.max(...this.symbols.map(s => s.x));
        sprite.x = rightmost + SYMBOL_STRIDE;
        sprite.texture = this.getRandomTexture();
        (sprite as any).__name = (sprite.texture as any).name || (sprite.texture as any).textureCacheIds?.[0];
      }
    }
    this.symbols.sort((a, b) => a.x - b.x);
  }

  private performSnap(delta: number): void {
    const leftmost = this.symbols[0];
    const offset = leftmost.x;
    const targetOffset = Math.round(offset / SYMBOL_STRIDE) * SYMBOL_STRIDE;
    const diff = targetOffset - offset;

    if (Math.abs(diff) <= SNAP_TOLERANCE) {
      const finalizeShift = diff;
      this.symbols.forEach(s => { s.x += finalizeShift; });
      this.snapping = false;
      this.state = 'idle';
      this.emit('stopped');
      return;
    }

    const shift = diff * SNAP_EASING * delta;
    this.symbols.forEach(s => { s.x += shift; });
  }

  public startSpin(): void {
    if (this.state === 'spinning') return;
    this.state = 'spinning';
    this.speed = 0;
    this.targetSpeed = this.maxSpeed;
    this.snapping = false;
  }

  /**
   * Signal to stop spinning gracefully.
   */
  public stopSpin(): void {
    this.targetSpeed = 0;
  }

  public update(delta: number): void {
    if (this.state !== 'spinning') return;

    if (!this.snapping) {
      if (this.speed < this.targetSpeed) {
        this.speed = Math.min(this.targetSpeed, this.speed + this.acceleration * delta);
      } else if (this.speed > this.targetSpeed) {
        this.speed *= this.decelRate;
        if (this.speed < STOP_SPEED_THRESHOLD && this.targetSpeed === 0) {
          this.speed = 0;
          this.snapping = true;
        }
      }
    }

    if (this.snapping) {
      this.performSnap(delta);
      return;
    }

    if (this.speed > 0) {
      for (const sprite of this.symbols) {
        sprite.x -= this.speed * delta;
      }
      this.recycleIfNeeded();
    }
  }

  /**
   * Current reel state.
   */
  public getState(): ReelState {
    return this.state;
  }

  /**
   * Exposed for tests: snapshot of symbol texture names in order.
   */
  public getSymbolTextureNames(): string[] {
    return this.symbols.map(s =>
      (s as any).__name ||
      (s.texture as any).name ||
      (s.texture as any).textureCacheIds?.[0] ||
      'unknown'
    );
  } 

  /**
   * Exposed for tests (position array).
   */
  public getSymbolPositions(): number[] {
    return this.symbols.map(s => s.x);
  }

  public _isSnapping(): boolean {
    return this.snapping;
  }
}
