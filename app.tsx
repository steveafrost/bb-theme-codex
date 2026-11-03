import { useEffect } from "react";
import {
  definePluginApp,
  experimental_useSidebarThreads,
  useComposer,
  useSettings,
  type PluginHomepageSectionProps,
} from "@get-bb/plugin-sdk/app";
import { bbLogoUrl } from "./bb-logo";
import { applyOptions, enabledOptions, type OptionValues } from "./options";
import "./app.css";

// Last applied options, so the attributes are on <html> as soon as the app
// starts instead of after settings load.
export const CACHE_KEY = "codex-theme:options";

export function readCachedOptions(storage: Pick<Storage, "getItem">): OptionValues {
  try {
    return enabledOptions(JSON.parse(storage.getItem(CACHE_KEY) ?? "{}"));
  } catch {
    return {};
  }
}

/** Mirrors the plugin settings onto <html> whenever they change. */
export function OptionAttributes() {
  const { values, isLoading } = useSettings();
  useEffect(() => {
    if (isLoading || values === undefined) return;
    const enabled = enabledOptions(values);
    applyOptions(document.documentElement, enabled);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(enabled));
    } catch {
      // Storage can be unavailable; the attributes still apply for this window.
    }
  }, [values, isLoading]);
  return null;
}

// New-thread welcome by Jaryd Diamond (bb-codex). Shown only with the
// "Centered welcome" setting on; theme CSS lays it out.
export function Welcome({ projectId }: PluginHomepageSectionProps) {
  const { projects } = experimental_useSidebarThreads();
  const { scope } = useComposer();
  // The homepage prop follows the route; the composer follows the project picker.
  const selectedProjectId = scope.kind === "new-thread" ? scope.projectId : projectId;
  const project = projects.find((item) => item.id === selectedProjectId);

  return (
    <div className="codex-welcome">
      <img className="codex-logo" src={bbLogoUrl} alt="" aria-hidden="true" />
      <h1>
        What should we build
        {project && !project.isPersonal ? <> in <span>{project.name}</span></> : null}?
      </h1>
    </div>
  );
}

export default definePluginApp((app) => {
  app.contentScripts.register({
    id: "option-attributes",
    mount() {
      try {
        applyOptions(document.documentElement, readCachedOptions(localStorage));
      } catch {
        // No storage: OptionAttributes applies the settings once they load.
      }
      return () => applyOptions(document.documentElement, {});
    },
  });
  app.slots.experimental_appOverlay({ id: "option-attributes", component: OptionAttributes });
  app.slots.homepageSection({ id: "welcome", title: "New thread", component: Welcome });
});

