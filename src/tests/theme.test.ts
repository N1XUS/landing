import { describe, expect, it } from "vitest";
import {
  PREPAINT_SCRIPT,
  THEME_COLORS,
  applyTheme,
  readStoredTheme,
  resolveTheme,
} from "../lib/theme";

describe("resolveTheme", () => {
  it("uses the stored preference when it is a valid theme", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("falls back to the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
    expect(resolveTheme(undefined, true)).toBe("dark");
  });
  it("ignores garbage stored values", () => {
    expect(resolveTheme("blue", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});

describe("readStoredTheme", () => {
  it("returns the stored theme", () => {
    expect(readStoredTheme({ getItem: () => "light" })).toBe("light");
  });
  it("returns null for missing or invalid values", () => {
    expect(readStoredTheme({ getItem: () => null })).toBeNull();
    expect(readStoredTheme({ getItem: () => "nope" })).toBeNull();
  });
  it("returns null when storage throws (private mode, blocked storage)", () => {
    expect(
      readStoredTheme({
        getItem: () => {
          throw new Error("denied");
        },
      }),
    ).toBeNull();
  });
});

interface FakeDoc {
  documentElement: {
    dataset: Record<string, string>;
    style: Record<string, string>;
  };
  querySelector: (sel: string) => { content: string } | null;
}

const fakeDoc = (): FakeDoc & { meta: { content: string } } => {
  const meta = { content: "" };
  return {
    meta,
    documentElement: { dataset: {}, style: {} },
    querySelector: (sel: string) =>
      sel === 'meta[name="theme-color"]' ? meta : null,
  };
};

describe("applyTheme", () => {
  it("sets data-theme, color-scheme and the theme-color meta", () => {
    const doc = fakeDoc();
    applyTheme(doc as unknown as Document, "light");
    expect(doc.documentElement.dataset.theme).toBe("light");
    expect(doc.documentElement.style.colorScheme).toBe("light");
    expect(doc.meta.content).toBe(THEME_COLORS.light);
  });
  it("tolerates a missing theme-color meta", () => {
    const doc = fakeDoc();
    doc.querySelector = () => null;
    expect(() => applyTheme(doc as unknown as Document, "dark")).not.toThrow();
    expect(doc.documentElement.dataset.theme).toBe("dark");
  });
});

describe("PREPAINT_SCRIPT", () => {
  // The inline pre-paint script must agree with resolveTheme() so the
  // server-rendered first paint and the hydrated app never disagree.
  const run = (stored: string | null, systemDark: boolean, throws = false) => {
    const doc = fakeDoc();
    const localStorage = {
      getItem: () => {
        if (throws) throw new Error("denied");
        return stored;
      },
    };
    const matchMedia = (q: string) => ({
      matches: q.includes("dark") ? systemDark : false,
    });
    new Function("localStorage", "matchMedia", "document", PREPAINT_SCRIPT)(
      localStorage,
      matchMedia,
      doc,
    );
    return doc;
  };

  it("matches resolveTheme for every input", () => {
    for (const stored of ["light", "dark", null, "junk"]) {
      for (const systemDark of [true, false]) {
        expect(run(stored, systemDark).documentElement.dataset.theme).toBe(
          resolveTheme(stored, systemDark),
        );
      }
    }
  });
  it("sets color-scheme and theme-color like applyTheme", () => {
    const doc = run("light", true);
    expect(doc.documentElement.style.colorScheme).toBe("light");
    expect(doc.meta.content).toBe(THEME_COLORS.light);
  });
  it("survives a throwing localStorage", () => {
    expect(run(null, true, true).documentElement.dataset.theme).toBe("dark");
  });
});
