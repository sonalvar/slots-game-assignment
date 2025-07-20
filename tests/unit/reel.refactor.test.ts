import { Reel } from '../../src/slots/Reel';

jest.mock('../../src/utils/AssetLoader', () => {
  return {
    AssetLoader: {
      getTexture: (name: string) => ({ name })
    }
  };
});

describe('Reel refactor (foundation)', () => {
  test('constructs with default symbol count and horizontal layout', () => {
    const reel = new Reel({ rng: () => 0.3 });
    const positions = reel.getSymbolPositions();
    expect(positions.length).toBeGreaterThan(0);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });

  test('uses injected RNG to pick textures deterministically', () => {
    const reel = new Reel({ rng: () => 0 });
    const textures = reel.getSymbolTextureNames();
    const unique = new Set(textures);
    expect(unique.size).toBe(1);
  });

  test('startSpin transitions to spinning and accelerates toward target', () => {
    const reel = new Reel();
    expect(reel.getState()).toBe('idle');
    reel.startSpin();
    expect(reel.getState()).toBe('spinning');
    for (let i = 0; i < 5; i++) reel.update(1);
    expect(reel.getState()).toBe('spinning');
  });

  test('stopSpin eventually returns to idle (with current skeleton)', () => {
    const reel = new Reel();
    reel.startSpin();
    for (let i = 0; i < 10; i++) reel.update(1);
    reel.stopSpin();
    for (let i = 0; i < 120; i++) reel.update(1);
    expect(reel.getState()).toBe('idle');
  });
});
