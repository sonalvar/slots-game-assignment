// Global test setup (executed after env is set).
jest.mock('pixi.js', () => require('./mocks/pixiMock'));
jest.mock('pixi-spine', () => require('./mocks/spineMock'));

(global as any).advanceFrames = (fn: (frame: number) => void, frames: number) => {
  for (let i = 0; i < frames; i++) fn(i);
};
