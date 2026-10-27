// bb-theme-codex — backend entry.
//
// The palette is declarative: `bb.themes` in package.json points bb at
// theme.css in this directory, which bb reads straight from the plugin
// directory. The only runtime surface is the install hook, which activates
// the palette so that installing the plugin is enough on its own.
import type { BbPluginApi } from "@get-bb/plugin-sdk";

/**
 * Must match `bb.themes[0].id` in package.json. bb lists a plugin theme as
 * `plugin:<pluginId>:<themeId>`.
 */
const THEME_ID = "plugin:codex-theme:codex";

export default async function plugin(bb: BbPluginApi) {
  bb.log.info("loaded — contributes the Codex palette");

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
