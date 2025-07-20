let globalMuted = false;

interface InstanceRecord {
  id: number;
  playing: boolean;
  volume: number;
  loop: boolean;
}

export class Howl {
  private static nextId = 1;
  private instances: InstanceRecord[] = [];
  private _volume: number;
  private _loop: boolean;

  constructor(opts: { src: string[]; volume?: number; loop?: boolean }) {
    this._volume = opts.volume ?? 1;
    this._loop = opts.loop ?? false;
  }

  play(): number {
    const id = Howl.nextId++;
    this.instances.push({
      id,
      playing: true,
      volume: this._volume,
      loop: this._loop,
    });
    return id;
  }

  stop(): void {
    this.instances.forEach(i => (i.playing = false));
  }

  volume(v?: number, id?: number): number {
    if (v === undefined) return this._volume;
    this._volume = v;
    if (id) {
      const inst = this.instances.find(i => i.id === id);
      if (inst) inst.volume = v;
    } else {
      this.instances.forEach(i => (i.volume = v));
    }
    return this._volume;
  }

  loop(l?: boolean, id?: number): boolean {
    if (l === undefined) return this._loop;
    this._loop = l;
    if (id) {
      const inst = this.instances.find(i => i.id === id);
      if (inst) inst.loop = l;
    } else {
      this.instances.forEach(i => (i.loop = l));
    }
    return this._loop;
  }

  unload(): void {
    this.instances = [];
  }

  __getInstances() {
    return this.instances;
  }
}

export const Howler = {
  mute(m: boolean) { globalMuted = m; },
  _isMuted() { return globalMuted; },
};
