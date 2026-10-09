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

Published to GitHub Pages on 2026-10-09 at https://am1va.github.io/cleardesk/. The user published the prepared repository through GitHub Desktop, then enabled main > /docs (confirmed by their settings screenshot). Local origin is https://github.com/am1va/cleardesk.git. Public GitHub Actions inspection confirms pages build and deployment completed with success for source commit 3b577847ad1f57bcad2281e0b14d646a2fc56af7, run https://github.com/am1va/cleardesk/actions/runs/37872497367. Live index.html, app.js, and style.css each returned HTTP 200 and matched the tested local release exactly. Full publication evidence is saved in verification/github-publication.json. GitHub Desktop credentials remain application-managed; this tool process did not obtain account credentials.

A separate local main-branch Git repository is initialized in this folder, using Robert Paul Pelo and am1va@users.noreply.github.com as the existing ROSHAYN author identity. The user selected the public repository name cleardesk rather than the local folder's name cleardesk-github. Pages uses main and /docs with GitHub's branch deployment workflow. Public tracking excludes verification, history, node_modules, logs, process IDs, and SQLite files. The Windows ownership exception was added through GitHub Desktop for this prepared folder, as shown in the user's screenshots; do not apply broad global trust exceptions.

The existing cloud API update has been published successfully through the Sites hosting plugin on 2026-10-09. Backend version 2, source e9ed1e8edaa079075cfb5997013620fab1c4cfdf, native deployment appgdep_6ac8442d0164819190e9d4bf16bd9f53 returned succeeded at the existing API URL. No database migration or audience change was made. Full backend evidence stays in ../cleardesk-online/verification/github-backend-publication.json. Actual live GitHub-to-backend browser verification also passed, as recorded below.

## Verification

- 37 cross-host static/API/isolation/restart checks passed against actual localhost:8087/cleardesk/ and localhost:8086. This includes relative assets, strict preflights, rejected origins/keys, no remote cookie fallback, separate records, cross-visitor edit/delete/link rejection, linked deletion, appointment pipeline updates, concurrent save preservation, and actual backend restart persistence.
- 74 actual Edge CRM workflow checks passed at 1440/390 px, including contacts, inquiries, stage updates, tasks, appointments, and mobile navigation.
- 89 actual Edge delete checks passed at 1440/390/320 px, including Cancel, Escape, stale confirmation, linked deletion, and real page-reload persistence.
- 16 actual Edge layout/keyboard checks passed at 320/720 px. Desktop/mobile/narrow screenshots were inspected; no broken pictures or runtime errors. Icons are inline SVG and the UI has no external image/font dependencies.
- 26 additional checks passed against the original cookie-based backend's isolation and SQLite storage, recorded in ../cleardesk-online/verification/isolation-results.json. Total across this change: 242 localhost checks.
- The saved root Start-CRM-GitHub-Preview.cmd launcher was run with NoBrowser and confirmed actual current localhost responses. Start-CRM.cmd and the original CRM remain separate.
- Source/results/screenshots remain in verification and verification/contact-delete, excluded from Git. Random browser keys are not copied into notes or result JSON. QA browser profiles and preview SQLite are local runtime stores and excluded from source/artifacts.
- Local SQLite tests exercise the Worker/D1 interface and actual persistence, not Cloudflare itself. Physical phones remain untested; actual live browser verification is recorded below.

## Live GitHub verification — 2026-10-09

- 32 actual Edge checks passed on the public GitHub URL at 1440/390 px, connecting across sites to the published API. Checked valid browser identity, fictional samples, viewport layout, asset loading, real Add contact form saves, linked task saves, a second visitor's unchanged sample workspace, Cancel preserving the contact, confirmed linked deletion, actual page reload retaining saves/deletion, and exact disposable-record cleanup. No browser runtime errors were reported.
- Desktop/mobile public screenshots were saved and visually inspected in verification/public. Live scripts and final results are saved alongside them. No private local CRM records were used, inspected through the cloud API, or uploaded. Test contact emails use example.com. Workspace keys remain in browser-managed localStorage and are not copied into result JSON or notes.
- The first test run incorrectly waited for Overview metrics after reloading Contacts. The saved failure-before-reload-selector-fix.json documents that QA selector failure; the selector was corrected to the loaded connection status. The earlier exact disposable test record was cleaned up by matching both its saved ID and example.com email. The final run passed all checks without changing application source.
- Only saved publication/verification notes changed locally after the public release. UI files still match the deployed commit. This portfolio remains a fictional demo rather than a real authenticated client workspace.

## Mobile menu scrolling fix — 2026-10-09

The user reported that the open mobile sidebar could not scroll. Reproduced on the actual localhost GitHub-style frontend: the body locks scrolling while the menu is open, but the fixed sidebar had overflow-y:visible and its lower profile extended below short viewports. Preserved the prior stylesheet and notes in history/before-mobile-menu-scroll, excluded from Git.

- Sidebar now has overflow-y:auto, overflow-x:hidden, overscroll-behavior-y:contain, and momentum scrolling support. Sidebar children do not shrink, so all navigation, demo information, and the profile remain reachable. Existing background lock and backdrop/navigation closing behavior are preserved.
- Applied to docs/style.css and its canonical source in ../cleardesk-online/frontend/style.css. The preparation script emits stylesheet query v=4 to avoid reusing an older browser-cached CSS response. JavaScript, record storage, API, and original cleardesk-crm data are unchanged.
- Before/after actual Edge checks used direct touch-start/move/end input on mobile and wheel input on desktop. The old stylesheet passed 13/21 checks; all four viewports failed to scroll the sidebar or reach its profile. The fixed stylesheet passed 21/21 at 390x640, 320x568, 844x390, and 1440x650, including page scroll after closing the menu, background staying still while open, route selection closing it, no horizontal overflow, complete icons, and no runtime errors. Screenshots were saved and inspected.
- QA correction: the initial synthetic-scroll helper did not generate reliable touch scrolling in this headless browser. Its initial results are preserved separately. The final before/after suite explicitly enables touch emulation and sends touch events directly. Results/scripts/screenshots are in verification/mobile-scroll and excluded from Git.
- Actual localhost responses serve the fixed CSS. Physical phones remain untested. This update is prepared locally; GitHub Desktop must push it before the public GitHub website serves it. Account credential probing again returned no usable credential to this process. No live-update claim is made before the push/deployment.
