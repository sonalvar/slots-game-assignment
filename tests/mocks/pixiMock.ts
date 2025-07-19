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
  
  export const Container = class {
    children: any[] = [];
    addChild(child: any) { this.children.push(child); return child; }
    removeChild(child: any) { this.children = this.children.filter(c => c !== child); }
  };
  
  export const Application = class {
    stage = new Container();
    ticker = { add: (_fn: any) => void 0 };
    renderer = { resize: () => void 0 };
  };
  
  export default { Texture, Sprite, Assets, Container, Application };
  