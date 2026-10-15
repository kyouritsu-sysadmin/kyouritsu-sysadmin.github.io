# Kyoritsu home page

The home page belongs at `https://kyouritsu-sysadmin.github.io/`. It links to the existing Docusaurus library at `/manuals/`; the Japanese home page at `/ja/` links to `/manuals/ja/`.

Four resource cards are configured: Manuals, Training Guide, Company Map, and Company Official Documents. Manuals is active. The remaining cards are clearly marked as coming soon with disabled buttons until you add their content or URLs.

## Build

Node.js 24 is required. There are no package dependencies and no install step.

```sh
npm run build
npm run check
```

`dist/` contains the complete static home site, including English and Japanese pages and assets. Edit `portal.config.json` to change the cards. To activate a planned card, set `status` to `available` and add localized `href` and `button` fields, following the Manuals entry. Both a path on this domain (such as `/training/`) and an HTTPS link are supported. Add the destination content before enabling its card.

## Deployment

This directory is part of `kyouritsu-sysadmin.github.io`. Run `npm run build` from the repository root to build and validate both the homepage and manuals into `_site/`. The root workflow publishes the combined artifact; this directory has no separate deployment. See the [repository guide](../README.md).

The manuals KYORITSU header returns to the root homepage. Existing document and Japanese URLs stay unchanged.

## Combined local preview

From the sibling `my-docs/` directory:

```sh
npm run build:preview
python3 -m http.server 3000 --directory ../portal/.preview --bind 127.0.0.1
```

Open `http://127.0.0.1:3000/`, choose Manuals, and select the KYORITSU header to return home. This assembles both sites for preview only; it does not change either production artifact or publish anything. `PREVIEW_HOME_URL` changes the preview host if needed.

Reference: [GitHub user/organization sites and project sites](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Shared visual theme

`src/theme.css` contains the approved blue palette and typography tokens. `src/styles.css` styles the home page. Mona Sans, Hubot Sans, and Noto Sans JP are bundled in `src/fonts/` with their licenses; the build copies all assets into `dist/assets/<content-hash>/`. The HTML, stylesheets, logo, and font imports use this shared versioned directory so a new asset revision does not reuse cached files from an older deployment. Already-open pages and cached HTML may still need a reload; this does not control GitHub Pages cache headers. The manuals generator also consumes this theme and these fonts. Both sites are published together.
