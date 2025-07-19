// Stub
export class Howl {
    private _src: string | string[];
    constructor(opts: { src: string | string[] }) {
      this._src = opts.src;
    }
    play() { return 1; }
    stop() { /* noop */ }
  }
  
  export const Howler = {
    _muted: false,
    mute(m: boolean) { this._muted = m; },
    volume: (_v?: number) => 1
  };
  