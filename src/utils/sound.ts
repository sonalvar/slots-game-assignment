import { Howl, Howler } from 'howler';

interface InternalEntry {
  howl: Howl;
}

export type AddOptions = {
  volume?: number;
  loop?: boolean;
  force?: boolean;  // overwrite if already present
};

export type PlayOptions = {
  volume?: number;
  loop?: boolean;
};

class SoundFacade {
  private sounds = new Map<string, InternalEntry>();

  add(id: string, src: string | string[], opts: AddOptions = {}): void {
    if (!opts.force && this.sounds.has(id)) return;

    const howl = new Howl({
      src: Array.isArray(src) ? src : [src],
      volume: opts.volume ?? 1,
      loop: opts.loop ?? false,
      preload: true,
    });

    this.sounds.set(id, { howl });
  }

  play(id: string, opts: PlayOptions = {}): number | null {
    const entry = this.sounds.get(id);
    if (!entry) {
      this.warnUnknown(id);
      return null;
    }
    const playbackId = entry.howl.play();
    if (opts.volume !== undefined) entry.howl.volume(opts.volume, playbackId);
    if (opts.loop !== undefined) entry.howl.loop(opts.loop, playbackId);
    return playbackId;
  }

  stop(id: string): void {
    const entry = this.sounds.get(id);
    if (!entry) {
      this.warnUnknown(id);
      return;
    }
    entry.howl.stop();
  }

  mute(muted: boolean): void {
    Howler.mute(muted);
  }

  isReady(id?: string): boolean {
    if (id) return this.sounds.has(id);
    return this.sounds.size > 0;
  }

  remove(id: string): void {
    const entry = this.sounds.get(id);
    if (entry) {
      (entry.howl as any).unload?.();
      this.sounds.delete(id);
    }
  }

  reset(): void {
    this.sounds.forEach(e => (e.howl as any).unload?.());
    this.sounds.clear();
  }

  _getHowl(id: string): Howl | undefined {
    return this.sounds.get(id)?.howl;
  }

  private warnUnknown(id: string): void {
    if (process?.env?.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(`[sound] Unknown sound id: ${id}`);
    }
  }
}

export const sound = new SoundFacade();
