import { sound } from '../../src/utils/sound';
import { Howler } from 'howler';

describe('sound (simple add/play API)', () => {
  afterEach(() => {
    sound.reset();
  });

  test('add + play returns playback id', () => {
    sound.add('click', 'click.mp3');
    expect(sound.isReady('click')).toBe(true);
    const id = sound.play('click');
    expect(typeof id).toBe('number');
  });

  test('play unknown returns null', () => {
    const id = sound.play('missing');
    expect(id).toBeNull();
  });

  test('stop halts all active instances', () => {
    sound.add('loop', 'loop.mp3');
    sound.play('loop');
    sound.play('loop');
    const howl = (sound as any)._getHowl('loop') as any;
    expect(howl.__getInstances().filter((i: any) => i.playing).length).toBe(2);
    sound.stop('loop');
    expect(howl.__getInstances().filter((i: any) => i.playing).length).toBe(0);
  });

  test('mute toggles global mute', () => {
    sound.mute(true);
    expect((Howler as any)._isMuted()).toBe(true);
    sound.mute(false);
    expect((Howler as any)._isMuted()).toBe(false);
  });

  test('duplicate add ignored unless force', () => {
    sound.add('dup', 'a.mp3');
    const first = (sound as any)._getHowl('dup');
    sound.add('dup', 'b.mp3');
    const stillFirst = (sound as any)._getHowl('dup');
    expect(stillFirst).toBe(first);
    sound.add('dup', 'c.mp3', { force: true });
    const replaced = (sound as any)._getHowl('dup');
    expect(replaced).not.toBe(first);
  });

  test('reset clears all', () => {
    sound.add('a', 'a.mp3');
    sound.add('b', 'b.mp3');
    expect(sound.isReady()).toBe(true);
    sound.reset();
    expect(sound.isReady()).toBe(false);
  });
});
