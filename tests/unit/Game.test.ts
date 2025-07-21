import { Game } from '../../src/Game';

describe('Game', () => {
  it('can be instantiated without throwing', () => {
    expect(() => new Game()).not.toThrow();
  });
});
