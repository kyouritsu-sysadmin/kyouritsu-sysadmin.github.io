# Future migration plan: Next.js + FastAPI

Status: Planning only. This document does not change the current application or deployment.

## Goal

Move the current homepage and document library into a small server-hosted website that can later grow into a managed application.

## Technology scope

- Frontend: Next.js
- Backend: FastAPI
- Hosting, database, file storage, authentication, and deployment: TBD

## Phase 1 — Prepare

- Inventory existing pages, documents, department hierarchy, and translations.
- Record current URLs so existing links can be preserved.
- Define the initial frontend/backend boundary.

## Phase 2 — Migrate the website

- Recreate the homepage and manuals navigation in Next.js.
- Preserve the blue theme, fonts, English/Japanese support, and PDF viewer.
- Preserve `/manuals/` and existing department/document routes.
- Introduce FastAPI endpoints for departments and document metadata.

## Phase 3 — Move to the server

- Configure the selected server environment.
- Deploy the Next.js frontend and FastAPI backend.
- Verify navigation, translations, PDF viewing, downloads, and existing URLs.
- Keep the current site available until the replacement is verified.

## Phase 4 — Extend into an application

- Add document upload and management.
- Add application administration.
- Define access controls and other previously discussed features separately.

## Completion criteria

- The existing website works through Next.js and FastAPI.
- Existing documents and links remain accessible.
- Future application features can be added incrementally.
