import { Octokit } from '@octokit/rest';

/**
 * Creates and configures an Octokit client for GitHub API interactions.
 * 
 * @param token - GitHub personal access token
 * @returns Configured Octokit instance
 */
export const createGitHubClient = (token: string): Octokit => {
  return new Octokit({
    auth: token,
  });
};

/**
 * Fetches repository information using Octokit.
 * 
 * @param client - Octokit client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Repository information
 */
export const getRepositoryInfo = async (
  client: Octokit,
  owner: string,
  repo: string,
) => {
  try {
    const { data } = await client.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error('Error fetching repository info:', error);
    throw error;
  }
};

/**
 * Creates a new GitHub release using semantic-release version info.
 * 
 * @param client - Octokit client instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param tagName - Release tag name (version)
 * @param name - Release name
 * @param body - Release notes
 * @returns Created release information
 */
export const createRelease = async (
  client: Octokit,
  owner: string,
  repo: string,
  tagName: string,
  name: string,
  body: string,
) => {
  try {
    const { data } = await client.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      name,
      body,
      draft: false,
      prerelease: false,
    });
    return data;
  } catch (error) {
    console.error('Error creating release:', error);
    throw error;
  }
};
