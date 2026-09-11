// Homepage blocks that sit between the hero (always first) and the contact
// band (always last). SiteSettings.homeBlocks stores the enabled keys in
// display order; anything not listed is hidden.
export const HOME_BLOCKS = [
  {
    key: "brands",
    label: "Brands marquee",
    description: "Logos of brands you've worked with, scrolling continuously to the left.",
  },
  {
    key: "work",
    label: "Selected work",
    description: "Projects marked “Show on homepage”, plus a More button to the Work page.",
  },
  {
    key: "summary",
    label: "Summary",
    description: "Your bio text and bio image or video.",
  },
  {
    key: "quickLinks",
    label: "Quick links",
    description: "Masonry grid of links, images and clips.",
  },
  {
    key: "stats",
    label: "Stats band",
    description: "Big numbers that count up on scroll.",
  },
  {
    key: "philosophy",
    label: "Philosophy",
    description: "Your philosophy text as a large pull-quote.",
  },
  {
    key: "services",
    label: "Services",
    description: "“What I do” cards.",
  },
] as const;

export type HomeBlockKey = (typeof HOME_BLOCKS)[number]["key"];

const KEYS = new Set<string>(HOME_BLOCKS.map((block) => block.key));

export function isHomeBlockKey(key: string): key is HomeBlockKey {
  return KEYS.has(key);
}

// Drops unknown keys and duplicates so stale data can never break the page.
export function cleanHomeBlocks(keys: string[]): HomeBlockKey[] {
  return [...new Set(keys)].filter(isHomeBlockKey);
}
