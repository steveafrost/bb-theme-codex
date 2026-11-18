import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { OPTION_KEYS, OPTIONS } from "./options";
// @ts-expect-error — plain ESM build script without types.
import { buildBbTheme, regions } from "./scripts/themes.mjs";

const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");
const theme = read("./theme.css");
const themeBb = read("./theme-bb.css");
const palette = read("./palettes/bb.css");
const manifest = JSON.parse(read("./package.json"));

describe("theme files", () => {
  it("theme-bb.css is generated from theme.css and palettes/bb.css", () => {
    expect(themeBb).toBe(buildBbTheme(theme, palette));
  });

  it("swaps every palette region", () => {
    expect([...regions(theme).keys()].sort()).toEqual([...regions(palette).keys()].sort());
    expect(themeBb).not.toContain("#8839ef"); // Catppuccin Latte mauve
    expect(themeBb).not.toContain("#cba6f7"); // Catppuccin Mocha mauve
  });

  it("rejects a palette that misses a region", () => {
    expect(() => buildBbTheme(theme, "")).toThrow(/missing regions/);
  });

  it.each(["./theme.css", "./theme-bb.css"])("%s stays under bb's 256 KB theme limit", (file) => {
    expect(read(file).length).toBeLessThan(256_000);
  });

  it("declares both themes with existing CSS files", () => {
    expect(manifest.bb.themes.map((t: { id: string }) => t.id)).toEqual(["codex", "codex-bb"]);
    for (const { css } of manifest.bb.themes) expect(() => read(css)).not.toThrow();
  });
});

describe("optional blocks", () => {
  const optionalSection = theme.slice(theme.lastIndexOf("/*", theme.indexOf("   Optional: ")));
  const selectors = optionalSection
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "")
    .match(/[^{};]+(?=\{)/g)!
    .map((s) => s.trim())
    .filter((s) => !s.startsWith("@"));

  it("every option has CSS in theme.css", () => {
    for (const key of OPTION_KEYS) expect(theme).toContain(`[${OPTIONS[key].attribute}]`);
  });

  it("gates every selector in the optional section behind a data-codex-* attribute", () => {
    expect(selectors.length).toBeGreaterThan(20);
    for (const list of selectors) {
      for (const selector of list.split(/,(?![^(]*\))/)) {
        expect(selector.trim(), selector).toMatch(/^:root(\.dark)?\[data-codex-[a-z-]+\]/);
      }
    }
  });

  // bb 0.50.1 wraps the wide new-thread column in an auto-height @container/page
  // inside the scrollport; without this rule the welcome stops filling the pane.
  it.each([
    ["theme.css", theme],
    ["theme-bb.css", themeBb],
  ])("%s fills the scrollport's page container on the wide new-thread screen", (_file, css) => {
    const wide = css.slice(css.indexOf("@media (min-width: 768px) and (min-height: 480px) {\n  :root[data-codex-welcome] {"));
    const block = wide.slice(0, wide.indexOf("\n}\n"));
    const rule =
      ':root[data-codex-welcome] .overflow-y-auto > [class~="@container/page"]:has(> [data-testid="root-compose-compact-home"] > [data-testid="plugin-homepage-sections"] > [id="plugin-homepage:codex-theme:welcome"]) {\n    height: 100%;\n  }';
    expect(block).toContain(rule);
    expect(css.split(rule)).toHaveLength(2);
    // The column rule it supports is still there.
    expect(block).toMatch(/\[class~="@container\/page"\] > div:has\(> \[data-testid="plugin-homepage-sections"\] > \[id="plugin-homepage:codex-theme:welcome"\]\) \{\n    min-height: 100%;/);
  });

  it("uses the plugin's own homepage section id", () => {
    expect(theme).not.toMatch(/:bb-codex:|bb-codex-/);
    expect(read("./app.css")).toContain("plugin-homepage:codex-theme:welcome");
  });
});
