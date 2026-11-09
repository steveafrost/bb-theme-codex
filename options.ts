// Optional changes, from Jaryd Diamond's bb-codex. Each one is a boolean plugin
// setting; when it is on, the app adds `attribute` to <html> and theme.css /
// theme-bb.css apply the matching block. All default to off, which keeps the
// original Codex Theme look.
export const OPTIONS = {
  welcome: {
    attribute: "data-codex-welcome",
    label: "Centered welcome on new threads",
    description:
      "A BB logo and \"What should we build in <project>?\" above a composer near the bottom of the new-thread screen. Wide windows only.",
  },
  composerFooter: {
    attribute: "data-codex-composer-footer",
    label: "Show the bar under the composer",
    description:
      "Keep the environment chip and context ring under the composer, without the \"New thread in this environment\" button.",
  },
  filledNavIcons: {
    attribute: "data-codex-filled-nav-icons",
    label: "Filled icon for the selected rail item",
    description: "High-contrast, filled glyph for the current page in the navigation rail.",
  },
  outlineOnLeft: {
    attribute: "data-codex-outline-left",
    label: "Thread outline on the left",
    description: "Place the thread outline on the left of the chat, opening toward the messages.",
  },
  instantSidebar: {
    attribute: "data-codex-instant-sidebar",
    label: "Instant sidebar",
    description: "Open and close the sidebar, and expand its sections, without animation.",
  },
  hideEmptySections: {
    attribute: "data-codex-hide-empty-sections",
    label: "Hide empty sidebar sections",
    description: "Hide expanded sidebar sections that have no threads, as Codex does. Collapsed sections keep their header.",
  },
  threadStatus: {
    attribute: "data-codex-thread-status",
    label: "Codex thread status",
    description: "A blue dot for unread finished threads and a ring spinner for working ones.",
  },
} as const;

export type OptionKey = keyof typeof OPTIONS;
export type OptionValues = Partial<Record<OptionKey, boolean>>;

export const OPTION_KEYS = Object.keys(OPTIONS) as OptionKey[];

/** Pick the enabled options out of raw settings values. */
export function enabledOptions(values: Record<string, unknown> | undefined): OptionValues {
  const enabled: OptionValues = {};
  for (const key of OPTION_KEYS) if (values?.[key] === true) enabled[key] = true;
  return enabled;
}

/** Make <html> carry exactly the attributes of the enabled options. */
export function applyOptions(root: Element, enabled: OptionValues): void {
  for (const key of OPTION_KEYS) {
    const { attribute } = OPTIONS[key];
    if (enabled[key]) root.setAttribute(attribute, "");
    else root.removeAttribute(attribute);
  }
}
