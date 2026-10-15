# Kyoritsu Library

See the [repository guide](../README.md) for development, content authoring, division configuration, validation, and automatic GitHub Pages deployment after merging into `main`.

```sh
npm ci
npm start
```

Edit `src/data/catalog.json`, add web content under `content/`, and put downloadable files under `static/files/`. Generated files are rebuilt automatically before start/build/typecheck.

## Department attachment folders

All 25 existing departments and sections have a folder under `static/files/`.
Empty folders contain `.gitkeep` so Git preserves them; leave that file in place
when adding attachments. Existing files and URLs are unchanged.

Folders use the catalog's division slugs. Sections have their own sibling
folders rather than nested department folders. The `parent` field in
`src/data/catalog.json` defines the website hierarchy and makes section
documents appear in their parent department's listing.

- `sales/` — Head Office Sales（本社営業）
- `design/` — Design Department（設計部）
- `electrical-design/` — Electrical Design Section（電気設計課）; parent: `design`
- `structural-design/` — Structural Design Section（構造設計課）; parent: `design`
- `production-management/` — Production Management Department（生産管理部）
- `production-scheduling/` — Production Scheduling Section（工程課）; parent: `production-management`
- `materials/` — Materials Section（資材課）; parent: `production-management`
- `general-affairs/` — General Affairs Department（総務部）
- `ai-iot/` — AI/IoT Group（AI/IOTグループ）
- `manufacturing/` — Manufacturing Department（製造部）
- `processing/` — Processing Section（加工課）; parent: `manufacturing`
- `frame/` — Frame Section（フレーム課）; parent: `manufacturing`
- `thin-sheet-metal-1/` — Thin Sheet Metal Section 1（薄物1課）; parent: `manufacturing`
- `painting/` — Painting Section（塗装課）; parent: `manufacturing`
- `wiring/` — Wiring Department（配線部）
- `wiring-a1/` — Wiring Section A-1（A-1課）; parent: `wiring`
- `wiring-a2-a3/` — Wiring Section A-2 (A-3)（A-2課（A-3課））; parent: `wiring`
- `wiring-b1-b2/` — Wiring Section B-1 (B-2)（B-1課（B-2課））; parent: `wiring`
- `wiring-b3/` — Wiring Section B-3（B-3課）; parent: `wiring`
- `inspection/` — Inspection Department（検査部）
- `quality-environment/` — Quality and Environmental Management Department（品質環境管理部）
- `engineering/` — Engineering Department（エンジニアリング部）
- `tokyo/` — Tokyo Branch（東京支店）
- `osaka/` — Osaka Branch（大阪支店）
- `fukuoka/` — Fukuoka Branch（福岡支店）

## Add an attachment

1. Copy your file into `static/files/<division>/`. For example:
   `static/files/electrical-design/wiring-guide.pdf`.
2. Append a record to the existing `documents` array in
   `src/data/catalog.json`. Separate records with commas; do not replace the
   existing entries. Copy this example and use your real title, description,
   file language, and update date:

```json
{
  "slug": "wiring-guide",
  "division": "electrical-design",
  "category": "manual",
  "title": "Wiring guide",
  "description": "Wiring reference for the Electrical Design Section.",
  "format": "PDF",
  "language": "日本語",
  "updated": "2026-10-15",
  "file": "files/electrical-design/wiring-guide.pdf"
}
```

The `file` path is relative to `static/`, so omit `static/` from its value.
The `division` field assigns ownership; copying a file alone does not create
its catalog entry or navigation link. Existing divisions are already configured.
Use lowercase, hyphen-separated slugs and preferably filenames without spaces.

Categories: `manual`, `guides`, `policies`, or `forms`.
For Word, Excel, and other attachments, use `"format": "File"` and the actual
file extension. PDFs use `"format": "PDF"` to enable the viewer.

3. Optionally add this property inside the existing `documents` object in
   `src/data/locales/ja.json` for Japanese display text:

```json
"electrical-design/manual/wiring-guide": {
  "title": "配線ガイド",
  "description": "電気設計課向けの配線参考資料。"
}
```

Both locales use the same attachment unless the Japanese entry specifies a
different `file`. Without a Japanese entry, the catalog text is used.

4. From the repository root, run `npm run build`. It validates the metadata,
   file paths, and both languages. Commit the attachment and catalog changes,
   open a PR into `main`, and merge it. The root workflow then builds, validates,
   and publishes both sites automatically.

The example document routes are:

- `/manuals/electrical-design/manual/wiring-guide/`
- `/manuals/ja/electrical-design/manual/wiring-guide/`

The example is documentation only; no placeholder document is registered.
To update a document, replace its attachment and update its date while keeping
its division, category, and slug stable to preserve links.

## Add a web guide

Create a Markdown file under `content/<division>/guides/` and register it with
`"format": "Guide"` and a `source` such as
`"content/electrical-design/guides/onboarding.md"`. Keep metadata in the catalog,
not Markdown front matter. Create these content folders as needed; the prepared
`static/files/` folders are for downloadable attachments.
