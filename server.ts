// bb-theme-codex — backend entry.
//
// The palette is declarative: `bb.themes` in package.json points bb at
// theme.css in this directory, which bb reads straight from the plugin
// directory. No runtime surface is needed, but `bb.server` is a required
// manifest field, so this factory exists to satisfy the loader.
import type { BbPluginApi } from "@get-bb/plugin-sdk";

export default async function plugin(bb: BbPluginApi) {
  bb.log.info("loaded — contributes the Codex palette");
}
