import { useEffect, useState } from "react";
import { FRAMEWORK_REPOS } from "../data/frameworkInfo";

export type StarSource = "live" | "cache" | "fallback";

export interface RepoInfo {
  /** "owner/repo" */
  repo: string;
  stars: number;
  forks?: number;
  openIssues?: number;
  language?: string;
  license?: string;
  pushedAt?: string;
  /** live = GitHub API'den çekildi, cache = daha önce çekilmiş, fallback = statik yaklaşık değer */
  source: StarSource;
  /** Verinin alındığı zaman (ms). fallback için 0. */
  fetchedAt: number;
}

const STORAGE_KEY = "arena-gh-repos";
const TTL_MS = 6 * 60 * 60 * 1000; // 6 saat

function readCache(): Record<string, RepoInfo> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, RepoInfo>) : {};
  } catch {
    return {};
  }
}

function initialData(): Record<string, RepoInfo | undefined> {
  const cache = readCache();
  const out: Record<string, RepoInfo | undefined> = {};
  for (const [name, info] of Object.entries(FRAMEWORK_REPOS)) {
    const cached = cache[name];
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
      out[name] = { ...cached, source: "cache" };
    } else {
      out[name] = { repo: info.repo, stars: info.fallbackStars, source: "fallback", fetchedAt: 0 };
    }
  }
  return out;
}

/**
 * Framework Matrisi için GitHub yıldız/fork/issue verilerini canlı çeker.
 * api.github.com unauthenticated istekleri saatte 60 istekle sınırlıdır;
 * başarılar localStorage'da 6 saat önbelleklenir, hata durumunda statik
 * yaklaşık değerler (fallbackStars) gösterilir.
 */
export function useGitHubStars(): Record<string, RepoInfo | undefined> {
  const [data, setData] = useState<Record<string, RepoInfo | undefined>>(initialData);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cache = readCache();
      const names = Object.keys(FRAMEWORK_REPOS);
      const results: Record<string, RepoInfo> = {};

      await Promise.all(
        names.map(async (name) => {
          const info = FRAMEWORK_REPOS[name]!;
          const cached = cache[name];
          if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
            results[name] = { ...cached, source: "cache" };
            return;
          }
          try {
            const res = await fetch(
              `https://api.github.com/repos/${info.repo}`,
              { headers: { Accept: "application/vnd.github+json" } }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const j = (await res.json()) as {
              stargazers_count?: number;
              forks_count?: number;
              open_issues_count?: number;
              language?: string | null;
              license?: { spdx_id?: string } | null;
              pushed_at?: string | null;
            };
            if (typeof j.stargazers_count !== "number") throw new Error("no stars");
            results[name] = {
              repo: info.repo,
              stars: j.stargazers_count,
              forks: j.forks_count,
              openIssues: j.open_issues_count,
              language: j.language ?? undefined,
              license: j.license?.spdx_id ?? undefined,
              pushedAt: j.pushed_at ?? undefined,
              source: "live",
              fetchedAt: Date.now(),
            };
          } catch {
            // API erişilemez (rate limit / çevrimdışı): statik yaklaşık değer
            results[name] = {
              repo: info.repo,
              stars: info.fallbackStars,
              source: "fallback",
              fetchedAt: cached?.fetchedAt ?? 0,
            };
          }
        })
      );

      if (cancelled) return;
      setData(results);

      // Yalnızca başarılı (canlı) sonuçları önbelleğe yaz
      const toSave: Record<string, RepoInfo> = {};
      for (const [k, v] of Object.entries(results)) {
        if (v.source === "live") toSave[k] = v;
      }
      if (Object.keys(toSave).length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch {
          /* yoksay */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
