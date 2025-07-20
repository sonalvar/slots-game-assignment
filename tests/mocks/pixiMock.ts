export class Texture {
    static from(name: string) {
      return new Texture(name);
    }
    constructor(public name: string) {}
  }
  
  export class Sprite {
    public x = 0;
    public y = 0;
    public width = 0;
    public height = 0;
    public texture: Texture;
    constructor(tex: Texture) {
      this.texture = tex;
    }
  }
  
  export const Assets = {
    get: (name: string) => Texture.from(name),
  };
  
  export class Container {
    children: any[] = [];
    private _listeners: Record<string, Function[]> = {};
  
    addChild(child: any) {
      this.children.push(child);
      return child;
    }
    removeChild(child: any) {
      this.children = this.children.filter(c => c !== child);
    }
  
    on(event: string, fn: Function, context?: any) {
      this._listeners[event] = this._listeners[event] || [];
      this._listeners[event].push(fn.bind(context || this));
      return this;
    }
  
    emit(event: string, ...args: any[]) {
      (this._listeners[event] || []).forEach(fn => fn(...args));
      return this;
    }
  }
  
  export const Application = class {
    stage = new Container();
    ticker = { add: (_fn: any) => void 0 };
    renderer = { resize: () => void 0 };
  };
  
  export default { Texture, Sprite, Assets, Container, Application };
  