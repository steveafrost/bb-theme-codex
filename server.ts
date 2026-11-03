// bb-theme-codex — backend entry.
//
// The palettes are declarative: `bb.themes` in package.json points bb at
// theme.css ("Codex") and theme-bb.css ("Codex (BB colors)"). This entry
// declares the optional-change settings (app.tsx reflects them onto <html>)
// and activates the palette on install, so installing is enough on its own.
import type { BbPluginApi } from "@get-bb/plugin-sdk";
import { OPTIONS, OPTION_KEYS, type OptionKey } from "./options";

type BooleanSetting = { type: "boolean"; label: string; description: string; default: boolean };

/**
 * Must match `bb.themes[0].id` in package.json. bb lists a plugin theme as
 * `plugin:<pluginId>:<themeId>`.
 */
const THEME_ID = "plugin:codex-theme:codex";

export default async function plugin(bb: BbPluginApi) {
  const descriptors = Object.fromEntries(
    OPTION_KEYS.map((key) => [
      key,
      { type: "boolean", label: OPTIONS[key].label, description: OPTIONS[key].description, default: false },
    ]),
  ) as Record<OptionKey, BooleanSetting>;
  bb.settings.define(descriptors);
  bb.log.info("loaded — contributes the Codex palettes");

  // Runs once, right after a fresh install (not on update, reload, enable, or
  // server restart). Only take over the appearance while the user is still on
  // bb's default: someone who deliberately picked another palette keeps it.
  bb.onInstall(async () => {
    const current = await bb.sdk.theme.get();
    if (current.themeId !== "default") {
      bb.log.info(
        `install: leaving theme '${current.themeId}' alone (not the default)`,
      );
      return;
    }
    await bb.sdk.theme.set(THEME_ID);
    bb.log.info(`install: activated ${THEME_ID}`);
  });
}
