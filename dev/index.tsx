import { createDevApp } from '@backstage/dev-utils';
import { githubStatsPlugin, GithubStatsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(githubStatsPlugin)
  .addPage({
    element: <GithubStatsPage />,
    title: 'Root Page',
    path: '/github-stats',
  })
  .render();
