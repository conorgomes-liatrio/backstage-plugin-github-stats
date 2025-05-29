import * as react_jsx_runtime from 'react/jsx-runtime';
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';

declare const githubStatsPlugin: _backstage_core_plugin_api.BackstagePlugin<{
    root: _backstage_core_plugin_api.RouteRef<undefined>;
}, {}, {}>;
declare const GithubStatsPage: () => react_jsx_runtime.JSX.Element | null;

declare const GitHubInfo: () => react_jsx_runtime.JSX.Element | null;

export { GitHubInfo, GithubStatsPage, githubStatsPlugin };
