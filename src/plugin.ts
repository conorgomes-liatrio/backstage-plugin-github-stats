import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const githubStatsPlugin = createPlugin({
  id: 'github-stats',
  routes: {
    root: rootRouteRef,
  },
});

export const GithubStatsPage = githubStatsPlugin.provide(
  createRoutableExtension({
    name: 'GithubStatsPage',
    component: () =>
      import('./components/GitHubInfo').then(m => m.GitHubInfo),
    mountPoint: rootRouteRef,
  }),
);
