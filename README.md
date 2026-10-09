# ClearDesk CRM portfolio demo

A working cleaning-service CRM demo by Robert Paul Pelo, with contacts, a pipeline, tasks, appointments, inquiries, and confirmed contact deletion. Use fictional information only.

## Hosting

Live website: https://am1va.github.io/cleardesk/. The public repository is **am1va/cleardesk**, with **Settings > Pages > Deploy from a branch > main > /docs**. GitHub's successful deployment and actual desktop/mobile browser checks were verified on 2026-10-09.

The public interface is in `docs/`. It uses the existing ClearDesk cloud API for durable, separate sample workspaces. The API URL appears in the HTML configuration, but the visitor-facing address can be GitHub Pages. No real local CRM records are included.

Your browser stores a random workspace key in localStorage. Records and revision history stay in the cloud database, not in GitHub. Clearing browser storage or using another browser opens another sample workspace. Treat the browser key as private; anyone with it can access that demo's records. No accounts, client authentication, GoHighLevel integration, email/SMS, or payments are configured.

`../cleardesk-online/scripts/prepare-github.mjs` builds the reviewed frontend into `docs/`. Run with `--preview` to build a localhost version connecting to the API preview at port 8086. `scripts/preview.mjs` serves that version at http://localhost:8087/cleardesk/. It requires the API preview running separately. The original local CRM stays at port 8084.

Project decisions, verification, and publication state are recorded in PROJECT-NOTES.md. Verification data, browser profiles, and local records are excluded from Git.

Run ../Start-CRM-GitHub-Preview.cmd to open the local GitHub-style preview. It builds the preview and starts only the two required preview servers if not already running. Start-CRM.cmd still opens the original local CRM.
