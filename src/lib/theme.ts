export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';

/** Browser-chrome color per theme (the `theme-color` meta). Mirrors --bg. */
export const THEME_COLORS: Record<Theme, string> = {
  dark: '#171717',
  light: '#fafafa',
};

const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark';

/**
 * Explicit stored choice wins; otherwise follow the OS. No stored value is
 * the "auto" state — the site tracks `prefers-color-scheme` until the user
 * touches the switcher.
 */
export function resolveTheme(
  stored: string | null | undefined,
  systemDark: boolean,
): Theme {
  if (isTheme(stored)) return stored;
  return systemDark ? 'dark' : 'light';
}

export function readStoredTheme(
  storage: Pick<Storage, 'getItem'>,
): Theme | null {
  try {
    const v = storage.getItem(THEME_KEY);
    return isTheme(v) ? v : null;
  } catch {
    // Private mode / blocked storage: behave as "auto".
    return null;
  }
}

export function persistTheme(
  storage: Pick<Storage, 'setItem'>,
  theme: Theme,
): void {
  try {
    storage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable: the choice still applies for this page view.
  }
}

export function applyTheme(doc: Document, theme: Theme): void {
  const root = doc.documentElement;
  root.dataset.theme = theme;
  // Native controls, scrollbars and form widgets follow the page.
  root.style.colorScheme = theme;
  const meta = doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = THEME_COLORS[theme];
}

/**
 * Inline `<script>` body run in <head> before first paint so the server-
 * rendered page never flashes the wrong theme. Must stay behaviourally
 * identical to resolveTheme() + applyTheme(); the test suite enforces it.
 */
export const PREPAINT_SCRIPT =
  `var s;try{s=localStorage.getItem('${THEME_KEY}')}catch(e){}` +
  `var t=s==='light'||s==='dark'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';` +
  `var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t;` +
  `var m=document.querySelector('meta[name="theme-color"]');` +
  `if(m)m.content=t==='dark'?'${THEME_COLORS.dark}':'${THEME_COLORS.light}';`;
