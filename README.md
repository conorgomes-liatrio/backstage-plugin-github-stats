# GitHub Stats Backstage Plugin

Source code for [this](https://www.npmjs.com/package/@conor-pythons-learn/backstage-plugin-github-stats?activeTab=readme) backstage plugin

## Overview

A simple app that displays repo info on components loaded into backstage.

Includes
- PR and Issue counts
- Displays readme
- Recent contributors

## Setup

1. Install with the following command

```bash
yarn --cwd packages/app add @conor-pythons-learn/backstage-plugin-github-stats
```


2. Import and add in `packages/app/src/components/catalog/EntityPage.tsx`

```diff
+ import { GitHubInfo } from '@conor-pythons-learn/backstage-plugin-github-stats';
  ...
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    ...
+   <Grid item md={12} xs={12}>
      <GitHubInfo />
    </Grid>
    ...
```
