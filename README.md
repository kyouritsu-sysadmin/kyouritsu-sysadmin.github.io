# Kyoritsu company site

One repository and one GitHub Pages deployment for the company homepage and document library.

## Structure and URLs

- `portal/`: homepage source, card configuration, shared theme and fonts.
- `my-docs/`: Docusaurus library, company directory, localized content and attachments.
- `scripts/`: combined production build and artifact checks.
- `_site/`: generated deployment output; never commit it.

English home is `/`, Japanese home is `/ja/`, English manuals are `/manuals/`, and Japanese manuals are `/manuals/ja/`. Existing document URLs stay unchanged. Docusaurus retains `baseUrl: "/manuals/"` even though this is the root Pages repository.

## Install, build and validate

Requires Node.js 24 and npm. Run from the repository root:

```sh
npm --prefix my-docs ci
npm run build
```

The root has no dependencies. The build validates the catalog and TypeScript, builds both homepage languages and both manuals languages, then assembles `portal/dist/` at `_site/` and `my-docs/build/` at `_site/manuals/`. It copies the manuals error page to `_site/404.html` for GitHub Pages. It verifies the actual combined output, including document routes, attachments, fonts, PDF.js runtime assets, links and production homepage URLs. Failed artifact validation removes the combined output.

To recheck an existing build without rebuilding:

```sh
npm run check
```

Production scripts pin the public site URL, homepage URL and `/manuals/` prefix so local preview environment variables cannot leak into a release.

## Local development and combined preview

For the document library development server:

```sh
npm --prefix my-docs start
```

For Home → Manuals → Home navigation on localhost:

```sh
npm run build:preview
python3 -m http.server 3000 --directory portal/.preview --bind 127.0.0.1
```

Open `http://127.0.0.1:3000/`. The preview uses a separate output directory and local homepage links. Never upload `portal/.preview/` as the production artifact. `PREVIEW_HOME_URL` can override the preview server URL.

## Publishing

The root `.github/workflows/pages.yml` builds and validates pull requests. It publishes only on **manual dispatch from the default branch** of `kyouritsu-sysadmin/kyouritsu-sysadmin.github.io`. Pushing a feature branch, opening a PR, or merging does not publish automatically.

1. Open a pull request with the migration branch and wait for the build to pass.
2. Merge into `main`.
3. In Settings → Pages, select GitHub Actions as the source.
4. Run Actions → Build and publish company site from `main`.
5. Verify `/`, `/ja/`, `/manuals/`, `/manuals/ja/`, direct document links and PDF downloads.

The workflow uploads only `_site/`; deployment permissions are restricted to the deployment job. For the initial cutover, disable the old `manuals` repository deployment workflow and unpublish its Pages site after the combined deployment is ready, then verify `/manuals/` is served by the new artifact. Keep the old repository as a backup. These remote changes are not performed by the build scripts.

For later content updates, commit the changes, merge, and run this single workflow. To roll back, revert the source commit on `main` and rerun the workflow.

## Homepage cards

Edit `portal/portal.config.json`. Manuals is available; Training Guide, Company Map, and Company Official Documents remain planned until their destinations exist. See [portal instructions](portal/README.md).

## Add or rename divisions

Edit `my-docs/src/data/catalog.json`. The company directory contains 25 entries: 13 top-level departments, groups, and branches and 12 child sections. Each entry has an English `name`, `japanese` name, and `romaji`; sections reference their department using `parent`. Japanese display text lives in `src/data/locales/ja.json`. The generator validates parent references, cycles, and Japanese names and refreshes document sidebar translations.

The sidebar tree and the department directory on the library home show the hierarchy, with the Japanese name (or English name in the Japanese locale) under each department. Department libraries include documents from their sections; each section also has its own library. The library home lists documents in a table sorted by last update. Search accepts English, Japanese, and romaji, with or without macrons. For example, `/manuals/design/` contains links to `/manuals/electrical-design/` and `/manuals/structural-design/`.

Head Office Sales (本社営業) retains the `sales` slug and all existing document URLs. New entries use descriptive, lowercase slugs. Treat published slugs as permanent so shared links keep working; document records use the owning department or section slug. Empty placeholder URLs (`division-02` through `division-23`) have been replaced by the named libraries.

## Add a PDF

1. Put the file in `my-docs/static/files/<division>/`, preferably with an ASCII filename.
2. Add an entry to `documents` in `my-docs/src/data/catalog.json`:

```json
{
  "slug": "product-reference",
  "division": "sales",
  "category": "manual",
  "title": "Product reference",
  "description": "A short description that helps colleagues find this manual.",
  "format": "PDF",
  "language": "English",
  "updated": "2026-10-15",
  "file": "files/sales/product-reference.pdf"
}
```

3. Run `npm run build` from `my-docs`. It appears in navigation and search automatically at `/manuals/sales/manual/product-reference/`.

The supplied Japanese PDF is copied unchanged to `static/files/sales/sales-training-ja.pdf`; its original file remains in the archived manuals repository. The date in the catalog comes from its filename.

## Add a web guide or other attachment

Create a Markdown or MDX file under `my-docs/content/<division>/<category>/`. Do not add front matter; the catalog owns its metadata. Add a document entry with `"format": "Guide"` and a `"source"` such as `"content/sales/guides/onboarding.md"`. Source paths are relative to `my-docs`.

For Word, Excel, or other downloads, put the file under `static/files/`, use `"format": "File"`, and specify `"file"`. Optional `"source"` adds instructions above an attachment. PDFs use `"format": "PDF"` to enable their preview. Add more categories to the catalog as needed. Restart `npm start` after editing the catalog or content; the generator runs before start, build, and typecheck. Do not edit `.generated-docs` directly.

## Japanese localization

English remains at `/manuals/`; Japanese is built at `/manuals/ja/`. The language menu preserves the current document route. Run `npm run build` to build both locales, or `npm start -- --locale ja` for Japanese development.

- Edit custom interface and catalog translations in `my-docs/src/data/locales/ja.json`. Division/category keys are their slugs; document keys are `<division>/<category>/<slug>`.
- Add Japanese Markdown/MDX under `my-docs/content/ja/` and set its `source` in the matching Japanese document entry. Missing translations fall back to the English catalog/content.
- Docusaurus navigation and sidebar translations live under `my-docs/i18n/ja/`.
- The `i18n/ja/docusaurus-plugin-content-docs/current/` folder is generated before start/build/typecheck; edit `content/ja/` and translation metadata instead.
- Changing the interface language does not translate or replace an attached PDF. Both locales use the same original PDF unless its catalog attachment is changed.

## Flipbook implementation

The browser downloads PDF.js and its worker, fonts, CMaps, and WASM from this site; no Google Drive integration or external viewer/CDN is used. The generator copies matching runtime files from the pinned PDF.js package. Node.js 24 is required. Nearby pages are rendered into bounded bitmaps and old bitmaps are released; thumbnails render when their panel scrolls into view. Standard PDF mode remains available for selectable text, PDF search, browser printing, and preview failures.

`page-flip@2.0.7` does not stop its animation loop when destroyed. The generator applies a small, checked lifecycle fix to a generated copy and preserves its license. Recheck that patch when upgrading the package. Never edit generated assets directly.

## Visual theme and fonts

The homepage and library use the shared blue palette in `portal/src/theme.css`: Snow `#F2F5FC`, Mist `#D6DFEF`, Ice `#B1CAEC`, Sky `#88AFDD`, Blue `#628FC8`, and Deep Blue `#395780`. White cards and PDF paper use dark ink `#24364B`; secondary text uses `#4C617B` for contrast. Deep blue is used for primary actions, selection indicators, and keyboard focus.

Mona Sans is used for body text and navigation, Hubot Sans for headings and branding, and Noto Sans JP for Japanese glyphs. Font assets and licenses are bundled in `portal/src/fonts/`; there are no runtime CDN requests. Unicode subsets load only as needed. The manuals generator copies the shared theme and fonts into `static/`, and the portal build includes them under `assets/`. Both are published together from this repository.
