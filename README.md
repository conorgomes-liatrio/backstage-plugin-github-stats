# GitHub Stats Plugin

Welcome to the GitHub Stats plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/github-stats](http://localhost:3000/github-stats).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Release Process

This project uses semantic-release for automated versioning and releases. The release process is triggered automatically when changes are pushed to the main branch.

### Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. Each commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature (triggers a minor version bump)
- `fix`: A bug fix (triggers a patch version bump)
- `docs`: Documentation changes
- `style`: Changes that don't affect the code's meaning (whitespace, formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `build`: Changes to the build system or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

Examples:
```
feat: add GitHub repository stats feature
fix: correct API response handling
docs: update installation instructions
```

### GitHub Integration

The plugin uses Octokit to interact with the GitHub API. See the `src/utils/githubClient.ts` file for utility functions that can be used to interact with GitHub.
