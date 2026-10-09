# ClearDesk on GitHub Pages

## Scope and authorization — 2026-10-09

The user asked to use GitHub instead of the chatgpt.site address and authorized proceeding with the proposed frontend/backend connection. Prepare a public repository named cleardesk under am1va. Keep the reviewed UI, existing cloud API, fictional records per visitor, and original cleardesk-crm localhost data. No custom domain is requested. No existing user contact data is uploaded.

## Design and persistence

- Pages serves static files in docs. Relative asset links work under /cleardesk/ rather than requiring domain-root files.
- A public API URL is embedded through a cleardesk-api meta tag. It is configuration, not a secret.
- Each browser creates its own cryptographically random cloud workspace key. It is sent in Authorization, without third-party cookies. Only the exact am1va.github.io origin is enabled in the production backend. Browser origins do not include URL paths, so the origin permission applies to that account's Pages origin. No other owner origin is allowed.
- A Web Locks request avoids competing first-time tab initialization in supporting browsers. Browsers without Web Locks use a storage recheck; truly simultaneous first loads in those browsers are a known limitation. No existing workspace is silently replaced on an invalid key/server error.
- The key remains in browser localStorage until cleared. Records and past revisions remain cloud-managed D1 data. Clearing localStorage or using another browser creates a new sample workspace. Browser storage and chat histories are application-managed, outside workspace project-file storage.
- The API preserves first-party cookie workspaces on the original URL. GitHub visitors start separate fictional workspaces; existing cookies are not transferred between sites. All saves use the existing revision checks and linked-record deletion confirmation.
- Assets are the approved frontend, CSS, and inline SVG icons. No new external images/fonts are added.

## Publication state

Not published to GitHub yet. An existing Git credential probe returned no usable credential to this process; GitHub Desktop sign-in is application-managed. No authenticated GitHub repository/API action has been performed. The expected URL https://am1va.github.io/cleardesk/ must not be reported as live without successful deployment evidence.

A separate local main-branch Git repository is initialized in this folder, using Robert Paul Pelo and am1va@users.noreply.github.com as the existing ROSHAYN author identity. No remote origin is set so GitHub Desktop can show Publish repository. Choose the public repository name **cleardesk** rather than the local folder's default name cleardesk-github. Enable Pages through main and /docs after publishing. No custom workflow is required for this branch deployment. Public tracking excludes verification, history, node_modules, logs, process IDs, and SQLite files.

The existing cloud API update has been published successfully through the Sites hosting plugin on 2026-10-09. Backend version 2, source e9ed1e8edaa079075cfb5997013620fab1c4cfdf, native deployment appgdep_6ac8442d0164819190e9d4bf16bd9f53 returned succeeded at the existing API URL. No database migration or audience change was made. This is backend deployment evidence; the GitHub frontend and live cross-host journey are still pending. Full backend evidence stays in ../cleardesk-online/verification/github-backend-publication.json.

## Verification

- 37 cross-host static/API/isolation/restart checks passed against actual localhost:8087/cleardesk/ and localhost:8086. This includes relative assets, strict preflights, rejected origins/keys, no remote cookie fallback, separate records, cross-visitor edit/delete/link rejection, linked deletion, appointment pipeline updates, concurrent save preservation, and actual backend restart persistence.
- 74 actual Edge CRM workflow checks passed at 1440/390 px, including contacts, inquiries, stage updates, tasks, appointments, and mobile navigation.
- 89 actual Edge delete checks passed at 1440/390/320 px, including Cancel, Escape, stale confirmation, linked deletion, and real page-reload persistence.
- 16 actual Edge layout/keyboard checks passed at 320/720 px. Desktop/mobile/narrow screenshots were inspected; no broken pictures or runtime errors. Icons are inline SVG and the UI has no external image/font dependencies.
- 26 additional checks passed against the original cookie-based backend's isolation and SQLite storage, recorded in ../cleardesk-online/verification/isolation-results.json. Total across this change: 242 localhost checks.
- The saved root Start-CRM-GitHub-Preview.cmd launcher was run with NoBrowser and confirmed actual current localhost responses. Start-CRM.cmd and the original CRM remain separate.
- Source/results/screenshots remain in verification and verification/contact-delete, excluded from Git. Random browser keys are not copied into notes or result JSON. QA browser profiles and preview SQLite are local runtime stores and excluded from source/artifacts.
- Local SQLite tests exercise the Worker/D1 interface and actual persistence, not Cloudflare itself. Physical phones and live GitHub-to-backend browser journeys remain unverified. GitHub publication is incomplete; a configured future URL must not be presented as live.
