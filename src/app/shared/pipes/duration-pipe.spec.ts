import { DurationPipe } from './duration-pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform minutes to hours and minutes', () => {
    expect(pipe.transform(90)).toBe('1h 30min');
    expect(pipe.transform(60)).toBe('1h');
    expect(pipe.transform(30)).toBe('30 min');
    expect(pipe.transform(0)).toBe('0 min');
    expect(pipe.transform(-5)).toBe('0 min');
  });

  it('should handle edge cases', () => {
    expect(pipe.transform(120)).toBe('2h');
    expect(pipe.transform(125)).toBe('2h 5min');
  });
});
