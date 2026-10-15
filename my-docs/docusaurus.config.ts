import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const homeUrl = process.env.HOME_URL || "https://kyouritsu-sysadmin.github.io/";
const baseUrl = process.env.BASE_URL || "/manuals/";
// Navbar active state is matched against the full pathname, including baseUrl.
const libraryHomeRegex = `^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(ja/)?$`;

const config: Config = {
  title: "Kyoritsu Library",
  tagline: "Your company knowledge, in one place.",
  favicon: "img/library.svg",
  url: process.env.SITE_URL || "https://kyouritsu-sysadmin.github.io",
  baseUrl: process.env.BASE_URL || "/manuals/",
  stylesheets: [`${process.env.BASE_URL || "/manuals/"}theme.css`],
  trailingSlash: true,
  customFields: { homeUrl },
  organizationName: "kyouritsu-sysadmin",
  projectName: "kyouritsu-sysadmin.github.io",
  deploymentBranch: "gh-pages",
  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
    localeConfigs: {
      en: { label: "English" },
      ja: { label: "日本語", htmlLang: "ja" },
    },
  },
  plugins: ["./plugins/library.cjs"],
  presets: [
    [
      "classic",
      {
        docs: {
          path: ".generated-docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          breadcrumbs: true,
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: "light", disableSwitch: true },
    navbar: {
      title: "KYORITSU",
      logo: { alt: "", src: "img/library.svg", href: homeUrl, target: "_self" },
      items: [
        { type: "localeDropdown", position: "right" },
        {
          to: "/",
          label: "Documents",
          position: "left",
          activeBaseRegex: libraryHomeRegex,
        },
        {
          to: "/#divisions",
          label: "Departments",
          position: "left",
          // A hash link would otherwise match every route.
          activeBaseRegex: "(?!)",
        },
        {
          to: "/sales/guides/getting-started/",
          label: "How to use",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        { label: "Company home", href: homeUrl },
        { label: "Document library", to: "/" },
        { label: "How to use", to: "/sales/guides/getting-started/" },
      ],
      copyright: "Kyoritsu · Document library · Maintained by System Administration",
    },
    docs: { sidebar: { hideable: true } },
  } satisfies Preset.ThemeConfig,
};
export default config;
