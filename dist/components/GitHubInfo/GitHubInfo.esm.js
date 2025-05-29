import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { makeStyles, Grid, Card, CardHeader, CardContent, Box, Typography, Avatar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Progress } from '@backstage/core-components';
import ReactMarkdown from 'react-markdown';

const useStyles = makeStyles((theme) => ({
  contributorsList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1)
  },
  link: {
    color: "#1976d2",
    textDecoration: "underline",
    "&:hover": {
      textDecoration: "none"
    }
  },
  commitInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: 0
  },
  avatar: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5)
  }
}));
const GitHubInfo = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const githubUrl = entity.metadata.annotations?.["github.com/project-slug"];
  if (!githubUrl) {
    return null;
  }
  const githubAuth = useApi(githubAuthApiRef);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const token = await githubAuth.getAccessToken(["repo"]);
        const repoResponse = await fetch(`https://api.github.com/repos/${githubUrl}`, {
          headers: {
            Authorization: `token ${token}`
          }
        });
        if (!repoResponse.ok) {
          throw new Error("Failed to fetch repository data");
        }
        const readmeResponse = await fetch(`https://api.github.com/repos/${githubUrl}/readme`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.raw"
          }
        });
        if (!readmeResponse.ok) {
          throw new Error("Failed to fetch README");
        }
        const issuesResponse = await fetch(`https://api.github.com/repos/${githubUrl}/issues?state=open`, {
          headers: {
            Authorization: `token ${token}`
          }
        });
        if (!issuesResponse.ok) {
          throw new Error("Failed to fetch issues");
        }
        const prsResponse = await fetch(`https://api.github.com/repos/${githubUrl}/pulls?state=open`, {
          headers: {
            Authorization: `token ${token}`
          }
        });
        if (!prsResponse.ok) {
          throw new Error("Failed to fetch pull requests");
        }
        const commitsResponse = await fetch(`https://api.github.com/repos/${githubUrl}/commits`, {
          headers: {
            Authorization: `token ${token}`
          }
        });
        if (!commitsResponse.ok) {
          throw new Error("Failed to fetch commits");
        }
        const readmeContent = await readmeResponse.text();
        const issues = await issuesResponse.json();
        const prs = await prsResponse.json();
        const commits = await commitsResponse.json();
        const isBot = (username) => {
          const botPatterns = [
            /\[bot\]$/,
            // Ends with [bot]
            /bot$/i,
            // Ends with 'bot' (case insensitive)
            /^dependabot/,
            // Dependabot
            /^renovate/,
            // Renovate bot
            /^snyk-bot/,
            // Snyk bot
            /^greenkeeper/
            // Greenkeeper bot
          ];
          return botPatterns.some((pattern) => pattern.test(username));
        };
        const humanCommits = commits.filter(
          (commit) => commit.author && !isBot(commit.author.login)
        );
        const newData = {
          readme: readmeContent,
          issueCount: issues.length,
          issuesUrl: `https://github.com/${githubUrl}/issues`,
          prCount: prs.length,
          prsUrl: `https://github.com/${githubUrl}/pulls`,
          lastCommit: null,
          recentContributors: []
        };
        if (humanCommits.length > 0) {
          if (humanCommits[0].author) {
            newData.lastCommit = {
              date: new Date(humanCommits[0].commit.author.date).toLocaleDateString(),
              author: humanCommits[0].author.login,
              authorUrl: humanCommits[0].author.html_url,
              commitUrl: humanCommits[0].html_url,
              avatarUrl: humanCommits[0].author.avatar_url
            };
          }
          const oneMonthAgo = /* @__PURE__ */ new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const contributorsMap = /* @__PURE__ */ new Map();
          humanCommits.forEach((commit) => {
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
                  commitCount: 1
                });
              }
            }
          });
          newData.recentContributors = Array.from(contributorsMap.values());
        }
        setData(newData);
        setLoading(false);
        return newData;
      } catch (err) {
        console.error("Error fetching GitHub data:", err);
        setError(err.message);
        setLoading(false);
        return null;
      }
    };
    fetchGitHubData();
  }, [entity, githubAuth]);
  if (loading) {
    return /* @__PURE__ */ jsx(Progress, {});
  }
  if (error) {
    return /* @__PURE__ */ jsx(Alert, { severity: "error", children: error });
  }
  if (!data) {
    return /* @__PURE__ */ jsx(Alert, { severity: "warning", children: "No GitHub data available" });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "Repository Status" }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("a", { className: classes.link, href: data.issuesUrl, target: "_blank", rel: "noopener noreferrer", children: "Open Issues" }),
            ": ",
            data.issueCount
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("a", { className: classes.link, href: data.prsUrl, target: "_blank", rel: "noopener noreferrer", children: "Open Pull Requests" }),
            ": ",
            data.prCount
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "Recent Contributors" }),
        /* @__PURE__ */ jsx(CardContent, { children: data.lastCommit ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Box, { className: classes.commitInfo, sx: { marginBottom: 2 }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", style: { marginRight: "8px" }, children: "Latest commit:" }),
            /* @__PURE__ */ jsx(Avatar, { className: classes.avatar, src: data.lastCommit.avatarUrl, alt: data.lastCommit.author }),
            " ",
            /* @__PURE__ */ jsx("a", { className: classes.link, href: data.lastCommit.authorUrl, target: "_blank", rel: "noopener noreferrer", children: data.lastCommit.author }),
            " on ",
            /* @__PURE__ */ jsx("a", { className: classes.link, href: data.lastCommit.commitUrl, target: "_blank", rel: "noopener noreferrer", children: data.lastCommit.date })
          ] }),
          data.recentContributors.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Other contributors in the last 30 days:" }),
            /* @__PURE__ */ jsx(Box, { className: classes.contributorsList, children: data.recentContributors.filter((contributor) => data.lastCommit && contributor.login !== data.lastCommit.author).map((contributor) => /* @__PURE__ */ jsxs(Box, { className: classes.commitInfo, sx: { marginBottom: 1 }, children: [
              /* @__PURE__ */ jsx(Avatar, { className: classes.avatar, src: contributor.avatarUrl, alt: contributor.login }),
              " ",
              /* @__PURE__ */ jsx("a", { className: classes.link, href: contributor.profileUrl, target: "_blank", rel: "noopener noreferrer", children: contributor.login }),
              /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "textSecondary", style: { marginLeft: "8px" }, children: [
                "(",
                contributor.commitCount,
                " ",
                contributor.commitCount === 1 ? "commit" : "commits",
                " in the last 30 days)"
              ] })
            ] }, contributor.login)) })
          ] })
        ] }) : /* @__PURE__ */ jsx(Typography, { variant: "body1", color: "textSecondary", children: "No non-automated commits found. All changes were made by automated processes." }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { style: { marginTop: "24px" }, children: [
      /* @__PURE__ */ jsx(CardHeader, { title: "README" }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(ReactMarkdown, { children: data.readme }) })
    ] })
  ] });
};

export { GitHubInfo };
//# sourceMappingURL=GitHubInfo.esm.js.map
