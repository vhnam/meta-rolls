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

Renderer reaches main only through `window.api` (`src/renderer/src/hooks/useIpc.ts`). Types for that API live in `src/preload/index.d.ts` and stay aligned with `src/preload/index.ts`. Cross-process domain types (`Photo`, `Album`, `FilterCriteria`, …) live in `shared/types.ts`.

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
│   ├── photos.ts                  # scan folder, read EXIF/metadata
│   ├── albums.ts                  # save/load album layout
│   └── print.ts                   # Instax print
├── services/                      # pure Node logic — no Electron APIs
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
│   └── useIpc.ts                  # window.api wrapper
├── stores/                        # zustand/jotai/…
│   ├── photo-store.ts
│   └── album-store.ts
├── lib/
│   └── utils.ts                   # shadcn cn()
└── assets/
    └── main.css                   # Tailwind v4 @import + @theme

shared/
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
