import { siteConfig } from "./site-config";

export type GithubStats = {
  publicRepos: number;
  followers: number;
  totalStars: number;
  latestRepo: {
    name: string;
    description: string | null;
    url: string;
    updatedAt: string;
    language: string | null;
    stars: number;
  } | null;
  fetchedAt: string;
  ok: boolean;
};

type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
};

const REVALIDATE_SECONDS = 3600;

export async function getGithubStats(): Promise<GithubStats> {
  const username = siteConfig.githubUsername;
  const fallback: GithubStats = {
    publicRepos: 0,
    followers: 0,
    totalStars: 0,
    latestRepo: null,
    fetchedAt: new Date().toISOString(),
    ok: false,
  };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: { Accept: "application/vnd.github+json" },
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
        {
          next: { revalidate: REVALIDATE_SECONDS },
          headers: { Accept: "application/vnd.github+json" },
        }
      ),
    ]);

    if (!userRes.ok || !reposRes.ok) return fallback;

    const user = (await userRes.json()) as {
      public_repos: number;
      followers: number;
    };
    const repos = (await reposRes.json()) as Repo[];

    const ownRepos = repos.filter((r) => !r.fork && !r.archived);
    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

    const latest = ownRepos[0] ?? null;
    const latestRepo = latest
      ? {
          name: latest.name,
          description: latest.description,
          url: latest.html_url,
          updatedAt: latest.pushed_at,
          language: latest.language,
          stars: latest.stargazers_count,
        }
      : null;

    return {
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars,
      latestRepo,
      fetchedAt: new Date().toISOString(),
      ok: true,
    };
  } catch {
    return fallback;
  }
}
