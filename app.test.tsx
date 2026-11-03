import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PluginComposerScope } from "@get-bb/plugin-sdk/app";

const state = vi.hoisted(() => ({
  projects: [] as { id: string; name: string; isPersonal: boolean }[],
  scope: { kind: "new-thread", projectId: null } as PluginComposerScope,
}));
vi.mock("@get-bb/plugin-sdk/app", () => ({
  definePluginApp: () => ({}),
  experimental_useSidebarThreads: () => state,
  useComposer: () => state,
  useSettings: () => ({ values: undefined, isLoading: true }),
}));

import { CACHE_KEY, readCachedOptions, Welcome } from "./app";

describe("new-thread welcome", () => {
  beforeEach(() => {
    state.projects = [];
    state.scope = { kind: "new-thread", projectId: null };
  });

  it.each([null, "old"])("uses the composer project when the route project is %s", (projectId) => {
    state.projects = [
      { id: "old", name: "Other project", isPersonal: false },
      { id: "current", name: "checkout-web", isPersonal: false },
    ];
    state.scope = { kind: "new-thread", projectId: "current" };
    const html = renderToStaticMarkup(<Welcome projectId={projectId} />);
    expect(html).toContain("What should we build in <span>checkout-web</span>?");
    expect(html).not.toContain("Other project");
  });

  it.each([null, "missing", "personal"])("keeps a useful heading without a named project: %s", (projectId) => {
    state.projects = [
      { id: "personal", name: "Personal", isPersonal: true },
      { id: "old", name: "Previous project", isPersonal: false },
    ];
    state.scope = { kind: "new-thread", projectId };
    expect(renderToStaticMarkup(<Welcome projectId="old" />)).toContain("What should we build?");
  });

  it("follows project picker changes without a route change", () => {
    state.projects = [
      { id: "first", name: "First project", isPersonal: false },
      { id: "second", name: "Second project", isPersonal: false },
    ];
    state.scope = { kind: "new-thread", projectId: "first" };
    expect(renderToStaticMarkup(<Welcome projectId={null} />)).toContain("First project");
    state.scope = { kind: "new-thread", projectId: "second" };
    const html = renderToStaticMarkup(<Welcome projectId={null} />);
    expect(html).toContain("Second project");
    expect(html).not.toContain("First project");
  });

  it("renders project names as text", () => {
    state.projects = [{ id: "current", name: "<script>test</script>", isPersonal: false }];
    state.scope = { kind: "new-thread", projectId: "current" };
    const html = renderToStaticMarkup(<Welcome projectId="current" />);
    expect(html).toContain("&lt;script&gt;test&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});

describe("cached options", () => {
  const storage = (value: string | null) => ({ getItem: (key: string) => (key === CACHE_KEY ? value : null) });

  it("returns only enabled, known options", () => {
    expect(readCachedOptions(storage(JSON.stringify({ welcome: true, threadStatus: false, bogus: true })))).toEqual({
      welcome: true,
    });
  });

  it.each([null, "not json", "[]", "null"])("falls back to no options for %s", (value) => {
    expect(readCachedOptions(storage(value))).toEqual({});
  });
});

