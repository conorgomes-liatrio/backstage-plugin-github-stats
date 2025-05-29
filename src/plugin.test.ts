import { githubStatsPlugin } from './plugin';

describe('pet-pics', () => {
  it('should export plugin', () => {
    expect(githubStatsPlugin).toBeDefined();
  });
});
