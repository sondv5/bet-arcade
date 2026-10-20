# Security Policy

## Supported versions

| Version | Supported |
| :--- | :--- |
| `main` (latest) | ✅ |
| Older releases | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report it privately via one of these channels:

- GitHub's [private vulnerability reporting](https://github.com/sondv5/bet-arcade/security/advisories/new)
  on this repository (preferred), or
- a direct message to the maintainer (`@sondv5`).

Please include:

- a description of the issue and its impact,
- the affected version or commit,
- steps to reproduce, and
- any proof-of-concept code or screenshots.

You can expect an acknowledgement within **72 hours** and a status update
within **7 days**. If the report is accepted, a fix and a coordinated release
will be prepared, and you will be credited unless you prefer to stay anonymous.

## Scope notes

BÉT! is a **fully client-side** app: there is no server, no database and no
account system. All player data is stored locally in the browser's
`localStorage` and never leaves the device. This means:

- there is no authentication surface to attack,
- no server-side data to breach,
- clearing site data removes every trace of the app.

Security reports therefore mostly concern the service worker / offline cache,
the local storage handling, and dependency vulnerabilities. Dependency updates
are tracked by Dependabot and the CI workflow fails on a broken build.
