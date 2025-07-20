import { Reel } from '../../src/slots/Reel';

jest.mock('../../src/utils/AssetLoader', () => {
  return {
    AssetLoader: {
      getTexture: (name: string) => ({ name })
    }
  };
});

describe('Reel horizontal movement & snapping', () => {
  test('symbols move left while spinning', () => {
    const reel = new Reel({ rng: () => 0.1, symbolCount: 5 });
    const before = reel.getSymbolPositions().slice();
    reel.startSpin();
    for (let i = 0; i < 10; i++) reel.update(1);
    const after = reel.getSymbolPositions();
    // At least one symbol should have moved left (x decreased)
    let moved = false;
    for (let i = 0; i < before.length; i++) {
      if (after[i] < before[i]) { moved = true; break; }
    }
    expect(moved).toBe(true);
  });

  test('recycling occurs when symbols exit left', () => {
    const reel = new Reel({ rng: () => 0.2, symbolCount: 3 });
    reel.startSpin();
    (reel as any).speed = 100;
    for (let i = 0; i < 20; i++) reel.update(1);
    const positions = reel.getSymbolPositions();
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });

  test('stopSpin triggers deceleration then snapping then stopped event', () => {
    const reel = new Reel({ rng: () => 0.3 });
    const events: string[] = [];
    (reel as any).on('stopped', () => events.push('stopped'));
    reel.startSpin();
    for (let i = 0; i < 30; i++) reel.update(1);
    reel.stopSpin();
    // Simulate enough frames to decelerate and snap
    for (let i = 0; i < 300 && reel.getState() !== 'idle'; i++) {
      reel.update(1);
    }
    expect(events).toContain('stopped');
    expect(reel.getState()).toBe('idle');
    const positions = reel.getSymbolPositions();
    const diffs = positions.slice(1).map((x, i) => x - positions[i]);
    const strideApprox = diffs.every(d => Math.abs(d - (140 + 10)) < 3);
    expect(strideApprox).toBe(true);
  });

  test('snapping phase flag visible just before idle', () => {
    const reel = new Reel();
    reel.startSpin();
    for (let i = 0; i < 40; i++) reel.update(1);
    reel.stopSpin();
    let observedSnapping = false;
    for (let i = 0; i < 400 && reel.getState() !== 'idle'; i++) {
      reel.update(1);
      if ((reel as any)._isSnapping()) {
        observedSnapping = true;
        break;
      }
    }
    expect(observedSnapping).toBe(true);
  });
});
