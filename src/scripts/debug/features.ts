// Feature flags and debug switches (?fx=off:<name>) per docs/02-engineering/dev-environment.md.
// Active in preview, development, and test builds; tree-shaken in production.

export type FeatureName =
  | 'scrub'
  | 'reveal'
  | 'marquee'
  | 'cursor'
  | 'lenis'
  | 'tags'
  | 'filter'
  | 'view'
  | 'tilt'
  | 'scrollspy'
  | 'compare'
  | 'parallax'
  | 'pull'
  | 'spotlight'
  | 'skills'
  | 'experience'
  | 'repel'
  | 'distortion'
  | 'form';

let disabledCache: Set<string> | null = null;

export function isFeatureDisabled(feature: FeatureName): boolean {
  if (typeof window === 'undefined') return false;

  if (!disabledCache) {
    disabledCache = new Set<string>();
    try {
      const params = new URLSearchParams(window.location.search);
      const fxEntries = params.getAll('fx');
      for (const entry of fxEntries) {
        if (entry.startsWith('off:')) {
          const names = entry
            .slice(4)
            .split(',')
            .map((s) => s.trim().toLowerCase());
          for (const name of names) {
            if (name) disabledCache.add(name);
          }
        }
      }
    } catch {
      // Ignore URL parse errors
    }
  }

  return disabledCache.has(feature.toLowerCase());
}
