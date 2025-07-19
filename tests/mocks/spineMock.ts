export class Spine {
    state = {
      setAnimation: (_track: number, _name: string, _loop: boolean) => ({})
    };
    onCompleteCallbacks: Array<() => void> = [];
    on(event: string, cb: () => void) {
      if (event === 'complete') this.onCompleteCallbacks.push(cb);
    }
    triggerComplete() {
      this.onCompleteCallbacks.forEach(cb => cb());
    }
  }
  