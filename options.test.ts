import { describe, expect, it } from "vitest";
import { applyOptions, enabledOptions, OPTION_KEYS, OPTIONS } from "./options";

function fakeRoot(initial: string[] = []) {
  const attributes = new Set(initial);
  return {
    attributes,
    setAttribute: (name: string) => void attributes.add(name),
    removeAttribute: (name: string) => void attributes.delete(name),
  } as unknown as Element & { attributes: Set<string> };
}

describe("options", () => {
  it("uses a distinct data-codex-* attribute per option", () => {
    const attributes = OPTION_KEYS.map((key) => OPTIONS[key].attribute);
    expect(new Set(attributes).size).toBe(attributes.length);
    for (const attribute of attributes) expect(attribute).toMatch(/^data-codex-[a-z-]+$/);
  });

  it("treats only `true` as enabled", () => {
    expect(enabledOptions({ welcome: true, instantSidebar: "true", threadStatus: 1, other: true })).toEqual({
      welcome: true,
    });
    expect(enabledOptions(undefined)).toEqual({});
  });

  it("sets enabled attributes and removes the rest", () => {
    const root = fakeRoot(["data-codex-thread-status", "class"]);
    applyOptions(root, { welcome: true, outlineOnLeft: true });
    expect([...root.attributes].sort()).toEqual(["class", "data-codex-outline-left", "data-codex-welcome"]);
    applyOptions(root, {});
    expect([...root.attributes]).toEqual(["class"]);
  });
});
