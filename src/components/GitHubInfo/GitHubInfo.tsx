import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { Card, CardContent, CardHeader, makeStyles, Avatar, Box, Grid, Theme, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Progress } from '@backstage/core-components';
import ReactMarkdown from 'react-markdown';

const useStyles = makeStyles((theme: Theme) => ({
  contributorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  link: {
    color: '#1976d2',
    textDecoration: 'underline',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  commitInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: 0,
  },
  avatar: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

type Contributor = {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  commitCount: number;
};

type GitHubData = {
  readme: string;
  issueCount: number;
  issuesUrl: string;
  prCount: number;
  prsUrl: string;
  lastCommit: {
    date: string;
    author: string;
    authorUrl: string;
    commitUrl: string;
    avatarUrl: string;
  } | null;
  recentContributors: Contributor[];
};

export const GitHubInfo = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const githubUrl = entity.metadata.annotations?.['github.com/project-slug'];

  // Don't render anything if there's no GitHub URL
  if (!githubUrl) {
    return null;
  }

  const githubAuth = useApi(githubAuthApiRef);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<GitHubData | null>(null);

  React.useEffect(() => {
    const fetchGitHubData = async (): Promise<GitHubData | null> => {
      try {

        const token = await githubAuth.getAccessToken(['repo']);
        
        // Fetch repository data
        const repoResponse = await fetch(`https://api.github.com/repos/${githubUrl}`, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        
        if (!repoResponse.ok) {
          throw new Error('Failed to fetch repository data');
        }

        // Fetch README
        const readmeResponse = await fetch(`https://api.github.com/repos/${githubUrl}/readme`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.raw',
          },
        });
        
        if (!readmeResponse.ok) {
          throw new Error('Failed to fetch README');
        }

        // Fetch issues count
        const issuesResponse = await fetch(`https://api.github.com/repos/${githubUrl}/issues?state=open`, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        
        if (!issuesResponse.ok) {
          throw new Error('Failed to fetch issues');
        }

        // Fetch PRs count
        const prsResponse = await fetch(`https://api.github.com/repos/${githubUrl}/pulls?state=open`, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        
        if (!prsResponse.ok) {
          throw new Error('Failed to fetch pull requests');
        }

        // Fetch latest commit
        // Get all commits (paginated by GitHub to latest 30 by default)
        const commitsResponse = await fetch(`https://api.github.com/repos/${githubUrl}/commits`, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        
        if (!commitsResponse.ok) {
          throw new Error('Failed to fetch commits');
        }

        const readmeContent = await readmeResponse.text();
        const issues = await issuesResponse.json();
        const prs = await prsResponse.json();
        const commits = await commitsResponse.json();

        // Process recent contributors
        type GitHubCommit = {
          author: {
            login: string;
            avatar_url: string;
            html_url: string;
          } | null;
          commit: {
            author: {
              date: string;
            };
          };
        };

        const isBot = (username: string) => {
          const botPatterns = [
            /\[bot\]$/,          // Ends with [bot]
            /bot$/i,             // Ends with 'bot' (case insensitive)
            /^dependabot/,       // Dependabot
            /^renovate/,         // Renovate bot
            /^snyk-bot/,         // Snyk bot
            /^greenkeeper/,      // Greenkeeper bot
          ];
          return botPatterns.some(pattern => pattern.test(username));
        };

        // Filter out bot commits first
        const humanCommits = commits.filter((commit: GitHubCommit) => 
          commit.author && !isBot(commit.author.login)
        );

        // Create base data even if there are no human commits
        const newData: GitHubData = {
          readme: readmeContent,
          issueCount: issues.length,
          issuesUrl: `https://github.com/${githubUrl}/issues`,
          prCount: prs.length,
          prsUrl: `https://github.com/${githubUrl}/pulls`,
          lastCommit: null,
          recentContributors: [],
        };

        // Only process contributor data if we have human commits
        if (humanCommits.length > 0) {

          // Set the last commit data regardless of time
          if (humanCommits[0].author) {
            newData.lastCommit = {
              date: new Date(humanCommits[0].commit.author.date).toLocaleDateString(),
              author: humanCommits[0].author.login,
              authorUrl: humanCommits[0].author.html_url,
              commitUrl: humanCommits[0].html_url,
              avatarUrl: humanCommits[0].author.avatar_url,
            };
          }

          // Filter commits from the last month for other contributors
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const contributorsMap = new Map<string, Contributor>();
          humanCommits.forEach((commit: GitHubCommit) => {
            const commitDate = new Date(commit.commit.author.date);
            if (commit.author && commitDate >= oneMonthAgo) {
              const existingContributor = contributorsMap.get(commit.author.login);
              if (existingContributor) {
                existingContributor.commitCount++;
              } else {
                contributorsMap.set(commit.author.login, {
                  login: commit.author.login,
                  avatarUrl: commit.author.avatar_url,
                  profileUrl: commit.author.html_url,
                  commitCount: 1,
                });
              }
            }
          });

          newData.recentContributors = Array.from(contributorsMap.values());
        }
        setData(newData);
        setLoading(false);
        return newData;
      } catch (err: unknown) {
        console.error('Error fetching GitHub data:', err);
        setError((err as Error).message);
        setLoading(false);
        return null;
      }
    };

    fetchGitHubData();
  }, [entity, githubAuth]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) {
    return <Alert severity="warning">No GitHub data available</Alert>;
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Repository Status" />
            <CardContent>
              <p>
                <a className={classes.link} href={data.issuesUrl} target="_blank" rel="noopener noreferrer">
                  Open Issues
                </a>: {data.issueCount}
              </p>
              <p>
                <a className={classes.link} href={data.prsUrl} target="_blank" rel="noopener noreferrer">
                  Open Pull Requests
                </a>: {data.prCount}
              </p>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Contributors" />
            <CardContent>
              {data.lastCommit ? (
                <>
                  <Box className={classes.commitInfo} sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle2" style={{ marginRight: '8px' }}>Latest commit:</Typography>
                    <Avatar className={classes.avatar} src={data.lastCommit.avatarUrl} alt={data.lastCommit.author} />{' '}
                    <a className={classes.link} href={data.lastCommit.authorUrl} target="_blank" rel="noopener noreferrer">{data.lastCommit.author}</a> on <a className={classes.link} href={data.lastCommit.commitUrl} target="_blank" rel="noopener noreferrer">{data.lastCommit.date}</a>
                  </Box>
                  {data.recentContributors.length > 1 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>Other contributors in the last 30 days:</Typography>
                      <Box className={classes.contributorsList}>
                        {data.recentContributors
                          .filter(contributor => data.lastCommit && contributor.login !== data.lastCommit.author)
                          .map(contributor => (
                            <Box key={contributor.login} className={classes.commitInfo} sx={{ marginBottom: 1 }}>
                              <Avatar className={classes.avatar} src={contributor.avatarUrl} alt={contributor.login} />{' '}
                              <a className={classes.link} href={contributor.profileUrl} target="_blank" rel="noopener noreferrer">{contributor.login}</a>
                              <Typography variant="body2" color="textSecondary" style={{ marginLeft: '8px' }}>
                                ({contributor.commitCount} {contributor.commitCount === 1 ? 'commit' : 'commits'} in the last 30 days)
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No non-automated commits found. All changes were made by automated processes.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card style={{ marginTop: '24px' }}>
        <CardHeader title="README" />
        <CardContent>
          <ReactMarkdown>{data.readme}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
};
