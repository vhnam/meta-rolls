# meta-rolls

Electron + React app: browse/filter photos, manage album layouts, print Instax.

## Worlds

Put new code in one of four roots. Match the world to the runtime:

| Root | Runtime | Owns |
| --- | --- | --- |
| `src/main/` | Node (main) | `app` lifecycle, `BrowserWindow`, menu, IPC handlers, `fs`, EXIF, print |
| `src/preload/` | isolated preload | `contextBridge` only — keep thin |
| `src/renderer/` | Chromium | React UI, TanStack Router, hooks, stores, Tailwind |
| `shared/` | main + renderer | Types and constants only — no Node APIs, no DOM |

Renderer reaches main only through `window.api` (`src/renderer/src/hooks/use-ipc.ts`). Types for that API live in `src/preload/index.d.ts` and stay aligned with `src/preload/index.ts`. Cross-process domain types (`Photo`, `Album`, `FilterCriteria`, …) live in `shared/types.ts`. IPC channel names live in `shared/ipc.ts`.

`src/main/index.ts` only orchestrates: import and call init functions from `app/`, `windows/`, `ipc/`.

## Place files

```text
src/main/
├── index.ts                       # entry — orchestrate only
├── app/                           # lifecycle & app metadata
│   ├── menu.ts                    # setupAppMenu()
│   ├── about.ts                   # setAboutPanelOptions (when it outgrows menu.ts)
│   └── lifecycle.ts               # app.on('ready' / 'window-all-closed' / 'activate'…)
├── windows/                       # BrowserWindow factories
│   ├── main-window.ts             # createMainWindow()
│   └── settings-window.ts         # second window, if Settings is not a renderer route
├── ipc/                           # handlers, one file per domain
│   ├── index.ts                   # registerAllIpcHandlers()
│   ├── settings.ts                # persist Zustand settings blob
│   ├── photos.ts                  # scan folder, read EXIF/metadata
│   ├── albums.ts                  # save/load album layout
│   └── print.ts                   # Instax print
├── services/                      # pure Node logic — no Electron APIs
│   ├── config-store.ts            # read/write userData config.json
│   ├── photo-scanner.ts
│   ├── exif-reader.ts
│   └── album-store.ts             # read/write album JSON
├── tray/
│   └── setup-tray.ts              # system tray, when added
└── updater/
    └── setup-updater.ts           # auto-update, when added

src/preload/
├── index.ts                       # contextBridge
└── index.d.ts                     # Window.api / Window.electron

src/renderer/src/
├── main.tsx                       # React entry
├── router.tsx                     # TanStack Router + hash history
├── routes/                        # file-based routes (TanStack Router)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── photos.tsx
│   └── albums.tsx
├── components/
│   ├── ui/                        # shadcn only (button, tabs, …)
│   ├── app-title-bar/
│   ├── select-photos/             # browse/filter
│   │   ├── FolderTree.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── PhotoGrid.tsx
│   │   └── MetadataPreview.tsx
│   └── manage-albums/             # album layout
│       ├── AlbumCanvas.tsx
│       ├── PrintPreview.tsx
│       └── LayoutControls.tsx
├── hooks/
│   ├── usePhotoFilter.ts
│   └── use-ipc.ts                 # window.api wrapper
├── types/                         # renderer domain types and const enums
│   ├── album.ts
│   ├── canvas.ts
│   ├── media.ts
│   └── settings.ts
├── constants/                     # renderer-only constants and mock data
│   ├── canvas.ts
│   ├── media.ts
│   └── settings.ts
├── stores/                        # Zustand, one store per screen concern
│   ├── photo-pool-store.ts        # scanned photos, filters, selection, media chrome
│   ├── album-store.ts             # album list, active album, current page
│   ├── canvas-store.ts            # selected slot, crop/fit
│   └── settings-store.ts          # theme, print format (Zustand persist → IPC)
├── lib/
│   └── utils.ts                   # shadcn cn()
└── assets/
    └── main.css                   # Tailwind v4 @import + @theme

shared/
├── ipc.ts                         # IPC channel names
└── types.ts

scripts/
└── dev.ts                         # vite renderer + watch main/preload + electron
```

New IPC domain → `src/main/ipc/<domain>.ts` plus Node work in `src/main/services/`. New window → `src/main/windows/<name>-window.ts`. New renderer feature → `src/renderer/src/components/<feature>/` plus a route under `src/renderer/src/routes/` when it is a page. Generated shadcn stays in `src/renderer/src/components/ui/`. Renderer imports use `#/` (`#/components/…`).

## Config and output

- Renderer: `vite.config.mts` → `out/renderer` (root `src/renderer`)
- Main: `vite.main.config.mts` → `out/main` (entry `src/main/index.ts`)
- Preload: `vite.preload.config.mts` → `out/preload` (entry `src/preload/index.ts`)
- Node TS: `tsconfig.node.json` (`src/main/`, `src/preload/`, scripts, vite configs)
- Web TS: `tsconfig.web.json` (`src/renderer/src/`, `src/preload/*.d.ts`)
- Shared types: imported by both tsconfigs
- Package: `electron-builder.yml`, `components.json`, `package.json`

Commands: `package.json` scripts. Format with Biome; lint with oxlint.

## Commits and versions

Versions start at `0.0.0`. Until a public MVP, bump **minor** for features and **patch** for everything else (`package.json` + `CHANGELOG.md`).

On every commit:

1. Split work by concern. Each commit stays at **15 files or fewer** (the initial project bootstrap is the exception).
2. Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`feat`, `fix`, `chore`, …). `feat` → minor; any other type → patch.
3. Add a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) entry for that version (Added / Changed / Fixed / …). Leave unfinished work under `[Unreleased]`.

Done when `package.json` version, the new `CHANGELOG.md` heading, and the commit message all describe the same bump.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **meta-rolls** (551 symbols, 807 relationships, 11 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/meta-rolls/context` | Codebase overview, check index freshness |
| `gitnexus://repo/meta-rolls/clusters` | All functional areas |
| `gitnexus://repo/meta-rolls/processes` | All execution flows |
| `gitnexus://repo/meta-rolls/process/{name}` | Step-by-step execution trace |

## CLI

`CLAUDE.md` only imports this file. `.gitnexusrc` sets `skipContextFiles` so `analyze` does not copy this block into `CLAUDE.md`, and `skipSkills` so `analyze` does not write repo-local skill copies (those paths are gitignored).

Install editor skills and MCP with `gitnexus setup` (writes `~/.cursor/skills/`). This repo gitignores skill files and keeps gitignored links in `.cursor/skills/` so Cursor **Customize → Skills** can list them. Reload the window after `setup`. Index the repo with `node .gitnexus/run.cjs analyze`.

| Task | Skill (`SKILL.md` in that folder) |
| --- | --- |
| Understand architecture / "How does X work?" | `gitnexus-exploring` |
| Blast radius / "What breaks if I change X?" | `gitnexus-impact-analysis` |
| Trace bugs / "Why is X failing?" | `gitnexus-debugging` |
| Rename / extract / split / refactor | `gitnexus-refactoring` |
| Tools, resources, schema reference | `gitnexus-guide` |
| Index, status, clean, wiki CLI commands | `gitnexus-cli` |

<!-- gitnexus:end -->
