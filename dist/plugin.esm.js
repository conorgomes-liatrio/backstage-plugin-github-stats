import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes.esm.js';

const githubStatsPlugin = createPlugin({
  id: "github-stats",
  routes: {
    root: rootRouteRef
  }
});
const GithubStatsPage = githubStatsPlugin.provide(
  createRoutableExtension({
    name: "GithubStatsPage",
    component: () => import('./components/GitHubInfo/index.esm.js').then((m) => m.GitHubInfo),
    mountPoint: rootRouteRef
  })
);

export { GithubStatsPage, githubStatsPlugin };
//# sourceMappingURL=plugin.esm.js.map
