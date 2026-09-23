# Changelog

All notable changes to Meta Rolls are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.13.0] - 2026-09-24

### Added

- Rolls tab and `/rolls` route: the bottom tab bar is now `Rolls · Media · Cull · Deliver`, and the Rolls screen shows the roll list beside the roll detail. ⌘/Ctrl+N opens the add-roll dialog.

## [3.12.0] - 2026-09-24

### Added

- Rolls components (not yet routed): `RollsList` (grouped by status with counts, search, status/stock/camera filters, sort), `RollDetail` (editable name, stock/camera/lens, exposures, shot ISO with push/pull, dates, notes, status control with next-step button, format-mismatch warning, duplicate, delete with confirm), and `RollFormDialog` (pick or create a stock, optional camera, quantity).

## [3.11.0] - 2026-09-24

### Added

- `useRollsStore` (Zustand) holding the rolls snapshot, list filters/sort, and roll actions (create, duplicate, update, set status, delete), hydrated at startup. `RollPatch` moved to `shared/rolls.ts`. Status/format/process/sort labels in `constants/rolls.ts`.

## [3.10.0] - 2026-09-24

### Added

- Rolls data layer (first slice of the Rolls workspace, see `docs/product/rolls/requirements.md`): SQLite tables for film stocks, cameras, lenses, rolls, dev jobs, and frames; `services/roll-store.ts` with CRUD, status changes that stamp the entry date, frame generation from the exposure count, bulk frame edit, and archive-instead-of-delete for gear; `ipc/rolls.ts` and `window.api.rolls`; and pure helpers in `shared/rolls.ts` (push/pull stops, default roll name, expiry). No UI yet.

## [3.9.12] - 2026-09-24

### Changed

- Grouped `docs/` by category: product context lives under `docs/product/`, dated audits under `docs/reviews/`.

## [3.9.11] - 2026-09-23

### Fixed

- `DeliverScreen` subscribed to the entire media pool store (`useMediaPoolStore()` with no selector) just to compute the selected photo, so it re-rendered on every unrelated media-pool change (search query, zoom, folder scans elsewhere). It now selects `getSelectedPhoto(state, albumPhotoItems)` directly.

## [3.9.10] - 2026-09-23

### Added

- Vitest for unit tests (`pnpm test` / `pnpm test:watch`), scoped to pure logic in `shared/` and `src/main/` — no DOM or Electron dependency needed. First suite: `shared/print.test.ts`, covering rotation normalization, slot layout, folio numbering, and `parseDeliverPdfExportRequest`'s validation (valid input, the legacy `firstPageIsLeftHand` alias, and every rejection path). Wired into the pre-commit hook alongside format/lint.

## [3.9.9] - 2026-09-23

### Changed

- Moved `services/pdf-export.ts` to `app/pdf-export.ts`. It creates a `BrowserWindow` and imports from `app/media-protocol.ts`, which violated AGENTS.md's rule that `services/` holds pure Node logic with no Electron APIs. No behavior change.

## [3.9.8] - 2026-09-23

### Fixed

- Thumbnail disk cache pruning (`thumbnail-cache.ts`) no longer re-stats every cached file on every single write once the cache is full. Eviction now only triggers once the cache is 400 entries over its 2000-entry cap, then trims back down to the cap in one batch — the expensive per-file `stat` pass runs roughly once every 400 writes instead of every write.

## [3.9.7] - 2026-09-23

### Fixed

- Error toasts no longer show Electron's raw IPC rejection text (`Error invoking remote method '…': Error: …`) — `use-ipc.ts` strips that wrapper down to the message the IPC handler actually threw.
- The main window now has a `minWidth`/`minHeight` (760×480), so the resizable browser/preview/albums panels can't be dragged into an unusably small layout.

## [3.9.6] - 2026-09-23

### Fixed

- `isOrientationAlreadyBaked`'s already-baked-rotation heuristic now skips RAW files instead of running against them. It compares the decoded image's dimensions to the file's own header dimensions to detect whether a camera already baked rotation into the pixels — for a RAW file, the decoded image is the embedded preview JPEG, not the sensor data, so that comparison isn't valid and could spuriously skip rotation on a portrait RAW photo. RAW previews (full-resolution and thumbnails) now always rotate unconditionally when the EXIF orientation calls for it, matching the behavior before the `image-decode.ts` extraction.

## [3.9.5] - 2026-09-23

### Fixed

- The `v` (revision) param used to build `meta-rolls-media://` URLs only ever changed when a photo was rotated inside the app — otherwise it stayed `0` for the life of the install. Combined with the immutable HTTP cache header added earlier, editing a photo in another app while (or before) it's shown in Meta Rolls could leave Chromium's disk cache serving the pre-edit image indefinitely, even across app restarts. `FileEntry`/`PhotoItem` now carry the file's `mtimeMs` from the folder scan, and a shared `resolvePhotoRevision` helper prefers the in-app rotation counter when present and otherwise falls back to that mtime, so the URL changes whenever the file's on-disk mtime does.

## [3.9.4] - 2026-09-23

### Fixed

- `mediaReadExif` and `mediaRotateImage` (IPC) now reject paths that aren't recognized image/RAW extensions. `mediaRotateImage` runs an exiftool _write_, so this closes off using it to modify arbitrary files the app process can reach.
- `readDisplayBytes` and `readThumbnailBytes` now check the extension themselves instead of relying on the protocol handler's gate — `pdf-export.ts` calls `readDisplayBytes` directly with paths from a print request, bypassing that gate entirely before this fix.
- The `will-navigate` guard now compares the navigated URL's path against the app's actual built `index.html`, instead of allowing any `file:` URL in production.
- Removed `bypassCSP: true` from the `meta-rolls-media` scheme registration — the page's CSP already allowlists the scheme in `img-src`, which is the only directive anything in the app needs it for.

## [3.9.3] - 2026-09-23

### Added

- A top-level error boundary: `router.tsx` sets a `defaultErrorComponent` (`AppErrorFallback`), so a render error in a screen is replaced by a recoverable "Something went wrong" panel with a Try again button, instead of a blank white window. It applies per-route, so a crash inside one screen leaves the title bar and preferences dialog (rendered by the root layout) usable.

## [3.9.2] - 2026-09-23

### Fixed

- Media, Cull, and Deliver screens each selected active-album photos as `state.albums.find(...)?.photos ?? []` directly inside a Zustand selector. Returning a fresh `[]` from a selector on every store notification is a known `useSyncExternalStore` re-render (and potential loop) trigger — a fresh install with zero albums hit this exact path. Replaced with a shared `selectActiveAlbumPhotos` selector backed by one stable empty-array constant.

## [3.9.1] - 2026-09-23

### Fixed

- `electron-builder.yml`'s `files` list is now an allowlist (`out/**` minus sourcemaps, `resources/**`, `package.json`, `node_modules/**`) instead of a denylist. The denylist form let every dev-only directory in the repo root — `.gitnexus` (a full source index, ~83 MB), `.agents`, `.claude`, `.cursor`, `.pnpm-store`, `AGENTS.md`, `CLAUDE.md`, `*.tsbuildinfo` — into `app.asar`. The packaged asar drops from ~101 MB to ~7.3 MB (plus ~21 MB unpacked for exiftool's bundled Perl runtime).

## [3.9.0] - 2026-09-23

### Added

- Grid/strip photo thumbnails now request a downscaled image instead of the full-resolution decode: `meta-rolls-media://` accepts a `w` (width) param, resizes with `nativeImage.resize`, re-encodes as JPEG, and caches the result on disk under `userData/thumbnails` (evicted by least-recently-read once the cache passes ~2000 entries). Rotation is applied after the resize rather than before, so a JS-level EXIF-rotation pass runs against the small thumbnail bitmap instead of the full-resolution one. Preview/fullscreen/print paths are unaffected — they still request full resolution.

## [3.8.11] - 2026-09-23

### Fixed

- `toMediaFileUrl` only appended its `v` revision param when the revision was truthy, so the common case (an untouched photo, revision `0`) never got a cache-busting param. It now appends `v` for any defined revision, including `0`.
- The two `deliver` canvas render paths (`deliver-canvas.tsx`, `deliver-canvas-slot.tsx`) now pass a revision to `toMediaFileUrl`, matching the other four call sites, so every media request is uniquely keyed by content.
- The `meta-rolls-media://` protocol now serves `cache-control: max-age=31536000, immutable` whenever the request carries a `v` param (all requests, after the two fixes above), instead of `no-cache` on every request. Scrolling the grid or the deliver canvas no longer re-reads/re-encodes photos the browser already has cached.

## [3.8.10] - 2026-09-23

### Changed

- `appId` no longer uses the electron-builder boilerplate `com.electron.app`; Linux `maintainer` no longer says `electronjs.org`.
- Dropped the macOS camera/microphone usage-description entries — the app never requests either.
- Removed the `publish` block pointing at a placeholder `example.com` update feed; nothing in the app reads it now that the unused `electron-updater` dependency is gone.

### Fixed

- Dropped `com.apple.security.cs.allow-dyld-environment-variables` from the macOS entitlements — it enables `DYLD_INSERT_LIBRARIES`-style dylib injection into the signed app and nothing in the app needs it.

## [3.8.9] - 2026-09-23

### Changed

- Moved every package the renderer bundles or that only runs at build/dev time (Tabler icons, TanStack, shadcn CLI, Tailwind, Vite plugins, `dayjs`, `zustand`, …) from `dependencies` to `devDependencies`. `dependencies` now only lists what the packaged main process actually `require()`s at runtime (`@electron-toolkit/utils`, `exiftool-vendored`, `image-size`). This shrinks `app.asar` from ~219 MB to ~98 MB, since electron-builder no longer copies the renderer's already-bundled `node_modules` into the installer.
- Removed the unused `electron-updater` dependency (never wired up to any update flow).

## [3.8.8] - 2026-09-23

### Fixed

- `REMOTE_DEBUGGING_PORT` is now only honored in development; a packaged build ignores it instead of opening a devtools-protocol port to anything on the machine.
- Reload/Force Reload/Toggle DevTools are removed from the View menu in production builds.

## [3.8.7] - 2026-09-23

### Fixed

- Upgraded `image-size` to 2.0.4, patching two high-severity DoS advisories (infinite loops parsing crafted HEIF/JXL headers) that ran against every photo the app reads dimensions for.

## [3.8.6] - 2026-09-23

### Removed

- Dropped the unused `window.electron` bridge (`@electron-toolkit/preload`'s `electronAPI`), which exposed raw `ipcRenderer.send`/`invoke`/`sendSync` on every channel to the renderer with no consumer in the app.

## [3.8.5] - 2026-09-23

### Fixed

- The renderer's `BrowserWindow` now runs with Chromium's OS-level sandbox enabled (`sandbox: false` removed). The preload script only touches `contextBridge`/`ipcRenderer`, so nothing depended on the unsandboxed renderer process.

## [3.8.4] - 2026-09-23

### Fixed

- Restricted `shell.openExternal` (from window-open) to `https:` URLs, and blocked in-page navigation to anything outside the app's own renderer.

## [3.8.3] - 2026-09-23

### Fixed

- `deliver.openExportedFile` now only opens paths this session actually wrote through `deliver.exportPdf`, instead of any path the renderer passes to `shell.openPath`.

## [3.8.2] - 2026-09-23

### Fixed

- The `meta-rolls-media://` protocol only serves files with a recognized image/RAW extension and no longer falls back to reading arbitrary files from disk via `net.fetch(file://…)`.

## [3.8.1] - 2026-09-22

### Added

- Lefthook pre-commit runs `pnpm format` then `pnpm lint`. `pnpm install` installs the hook via `prepare`.

### Changed

- `.gitignore` matches Skills CLI copies when they are symlinks (Claude links into `.agents`), so those trees stay untracked.

## [3.8.0] - 2026-09-22

### Added

- Albums persist whole-spread rotation in 90° steps. Deliver animates that rotation, can collapse the albums panel and print settings, and a post-export toast can open the saved PDF.

### Changed

- Deliver page strip uses a titled Pages header, and the print sidebar groups page vs layout fields.

## [3.7.0] - 2026-09-22

### Added

- Cull can hide the albums and metadata sidebar from a toggle on the preview toolbar. The album list header shows an Albums title.

## [3.6.7] - 2026-09-22

### Changed

- `.gitignore` excludes Skills CLI vendor trees (`banner-design`, `brand`, `design`, and the other locked installs). `skills-lock.json` records which skills `npx skills add` restored.

## [3.6.6] - 2026-09-22

### Changed

- AGENTS.md's commit rules now say not to add `Co-Authored-By` or other AI-attribution trailers to commit messages or PR descriptions.

## [3.6.5] - 2026-09-22

### Changed

- Media/Cull/Deliver screens, the album form dialog, photo previews, the preview zoom select, and the deliver canvas sidebar now use the new UI variants instead of one-off `className` overrides. Preferences dialog's title also renders the section's label instead of capitalizing its raw id via CSS.

## [3.6.4] - 2026-09-22

### Changed

- `ResizablePanelGroup`, `Spinner`, `FieldGroup`, `FieldLabel`, `DialogContent`, `ContextMenuShortcut`, and `Select{Trigger,Value,Item}` gained variant props (`tone`, `size`, `variant`, `indicatorPosition`) for the color/spacing/typography treatments consumers were previously overriding via `className`, fixing `shadcn/no-restyle` violations at the source.

## [3.6.3] - 2026-09-22

### Added

- `@shadcn/lint` oxlint plugin: enforces shadcn/ui components keep their own color, spacing, typography, and effects (`no-restyle`), flags raw Tailwind palette colors, arbitrary values, inline styles, and unknown classes. `no-restyle` and `no-arbitrary-values` are off inside `components/ui/**` (the primitives' own source).

## [3.6.2] - 2026-09-22

### Changed

- Renderer sorts `#/shared` imports with the other `#/` aliases.

## [3.6.1] - 2026-09-22

### Changed

- Switch uses Tailwind’s `group-has-focus-visible` variant and `h-3.5` for the small size.

## [3.6.0] - 2026-09-22

### Added

- Clicking empty space in a thumbnail pane clears the photo selection.

### Changed

- Folder icons in the album sidebar and media browser use a 16px size, and the thumbnail pane uses a card background with a divider.

## [3.5.0] - 2026-09-22

### Added

- Deliver reads print settings from the album, supports drag-to-slot placement, slot image rotate/remove, left-hand-first openings, and PDF export from the canvas sidebar.

## [3.4.0] - 2026-09-22

### Added

- Deliver can export an Instax spread layout as a PDF through a save dialog (Mini/Wide on Auto, A4, A5, or Letter).

## [3.3.0] - 2026-09-22

### Added

- Albums persist Instax preset, paper size, page numbers, and whether the first spread starts on the left leaf.

## [3.2.2] - 2026-09-22

### Changed

- Renderer imports shared types and the app icon through `#/shared` and `#/resources`.

## [3.2.1] - 2026-09-17

### Fixed

- Renderer assets use a relative base so the packaged `file://` build loads JS/CSS from the app bundle.

## [3.2.0] - 2026-09-17

### Added

- **Deliver workspace** (title-bar tab, `/deliver`): album sidebar, Instax spread canvas with pan/zoom, page strip, album photo details, and a metadata pane.

## [3.1.0] - 2026-09-17

### Added

- Canvas store tracks album spreads, slot swaps, and per-album Instax preset and paper size (A4, A5, Letter).
- Instax Mini/Wide card geometry (print size, image window, and thicker bottom border) for layout.

## [3.0.1] - 2026-09-17

### Changed

- Preview pan/zoom and the zoom menu live in shared helpers so the Deliver canvas can reuse them.

## [3.0.0] - 2026-09-17

### Changed

- Cull’s album strip is the shared AlbumDetails panel so other workspaces can reuse it.

### Added

- Album list rows and thumbnails can show a check badge when a photo is placed on a layout.

## [2.6.0] - 2026-09-16

### Added

- Thumbnails and fullscreen keep the previous bitmap until the next URL is decoded, and show a spinner while that photo is rotating.

## [2.5.0] - 2026-09-16

### Added

- Preview rotate animates 90° in place, queues extra turns, and preloads the rewritten file before swapping the image.
- A spinner overlays the preview while a rotate is in flight.

## [2.4.1] - 2026-09-16

### Fixed

- Press **Z** to Fit zoom on the capture phase so the shortcut still fires when another key handler would otherwise take it.

## [2.4.0] - 2026-09-16

### Added

- Rotate the selected photo 90° clockwise or counterclockwise from the preview context menu, the View menu, or ⌘]/⌘[ (Ctrl+[ / Ctrl]).
- Preview and thumbnail URLs include a revision so a rotate shows immediately.

## [2.3.0] - 2026-09-16

### Added

- Media protocol applies EXIF orientation so previews and thumbnails match the file.
- Rotate IPC writes the next Orientation tag, drops the display cache, and swaps stored album photo dimensions.

## [2.2.0] - 2026-09-16

### Added

- Shared empty states for albums, photo lists, and thumbnails.
- Metadata overview cells show the field name in a tooltip.
- Press **Z** to reset the preview to Fit; the zoom menu shows that shortcut.

### Changed

- Sheet slide-in offsets use Tailwind spacing tokens.

## [2.1.0] - 2026-09-16

### Added

- Media browser remembers which folders were expanded and which folder was selected, then restores that session after launch (including loading ancestors so nested folders reopen).
- Folder tree empty state when no volumes are available.

### Changed

- Folder tree and list rows use an open-folder icon for the selected or expanded folder.

## [2.0.1] - 2026-09-16

### Fixed

- Settings persist no longer races concurrent writes: `config.json` is locked per file, written via a temp file then renamed, and truncated JSON is recovered from the first complete object.

## [2.0.0] - 2026-09-15

Second public release. Browse the library in Media, then cull and rate album photos in a dedicated workspace.

### Added

- **Cull workspace** (title-bar tab, `/cull`): album sidebar, photo preview, details list or thumbnail strip, and a resizable metadata pane for the selected photo.
- **Star ratings** (0–5) on album photos. Cull list shows a Rating column; thumbnails show stars under the preview when a photo is selected or already rated.
- Folder icons on album sidebar rows that fill when the album is selected.
- Metadata overview **exposure and file cards** (aperture, shutter, white balance, ISO, size, color space, resolution).
- Album details thumbnails scroll as a **horizontal, zoomable strip**.
- Drag photos onto albums from Cull as well as Media; arrow keys move the photo selection in Cull the same way they do in Media.

### Changed

- The dedicated albums screen is now **Cull**. The title-bar tab and route are `Cull` / `/cull` (replaces `/albums`). Album data, IPC, and the Media albums panel are unchanged.
- Album details put more height on the preview and keep the photo list in a shorter pane; the thumbnail-size slider is separate from the list/thumbnail view toggles.
- The Media album name sits on the photo pane header; file-list and thumbnail chrome is shared across Media and Cull.

### Fixed

- Trackpad pinch zoom follows pinch distance without remounting the preview image.
- File-list column headers stay pinned while rows scroll.
- Any folder in the media browser tree can collapse, including the selected one, without closing nested folders that were already expanded.
- Long album names truncate with an ellipsis; unrated thumbnails keep a spacer so filenames line up.

### Removed

- The `/albums` route. Open Cull instead.

## [1.7.21] - 2026-09-15

### Changed

- `components/ui/{select,separator,sheet,sidebar,skeleton,tabs,toast,toggle-group,toggle,tooltip}.tsx` now import `cn` from `#/utils/common` instead of the bare `cn` package specifier. Completes the alias-to-explicit-import migration — verified with a clean dev server restart (no `cn` resolution errors).

## [1.7.20] - 2026-09-15

### Changed

- `components/ui/{button,card,context-menu,dialog,dropdown-menu,field,input,label,resizable}.tsx` now import `cn` from `#/utils/common` instead of the bare `cn` package specifier.

## [1.7.19] - 2026-09-15

### Changed

- Replaced the `vite.config.mts` alias that silently redirected the bare `cn` package specifier to the project's `cn()` wrapper with explicit `import { cn } from '#/utils/common'` in every consumer (shadcn's `components/ui/*` plus `components/photo-list/*`). No more magic import-rewriting — the wrapper is just an ordinary import now. Updated `components.json`'s `utils` alias to match, and fixed its stale `tailwind.css` path (`assets/main.css` → `styles/global.css`).

## [1.7.18] - 2026-09-15

### Fixed

- The entire app failed to start in dev (`Failed to resolve import "cn" from ...`, hitting every `components/ui/*` file) because `vite.config.mts` aliased the bare `cn` package specifier to `src/renderer/src/lib/utils.ts`, a path deleted when `lib/utils.ts` was merged into `utils/common/cn.ts`. Repointed the alias.

## [1.7.17] - 2026-09-15

### Fixed

- Dragging a photo onto an album in the Cull sidebar now actually moves it — `CullScreen` never had a `DragDropProvider` ancestor, so the drag/drop affordances rendered but silently did nothing.
- Arrow-key photo navigation now works in Cull, not just Media — `CullScreen` sets the shared `photoPane` state on mount and calls `useMediaPhotoArrowSelection()`.

## [1.7.16] - 2026-09-15

### Changed

- Rewrote AGENTS.md's "Place files" tree to match the real current file structure (`modules/media`, `modules/cull`, `modules/preferences`, the shared `components/` set, `utils/{common,folder,metadata,photo,preview}`, `layouts/`, `schemas/`, `styles/`) instead of the stale pre-implementation scaffold (nonexistent `select-photos`/`manage-albums` components, `routes/photos.tsx`, camelCase hooks, `shared/types.ts`, `lib/`). Corrected the cross-process types description to match `shared/album.ts` and `shared/media.ts`, and noted that `src/main/index.ts` still defines `createWindow()` inline pending extraction into `windows/`.

## [1.7.15] - 2026-09-15

### Changed

- Repointed the 10 consumers of `cn` from `#/lib/utils` to `#/utils/common`.

## [1.7.14] - 2026-09-15

### Changed

- Merged `lib/utils.ts` (shadcn's `cn()`) into `utils/common/` alongside `is-editable-keyboard-target.ts`, removing the confusing split between `src/lib/utils` and `src/utils`. Updated `components.json`'s shadcn aliases (`utils`, `lib`) to point at the new location so future `shadcn add` scaffolds generate correct imports.

## [1.7.13] - 2026-09-15

### Changed

- Grouped the rest of `utils/` by area of work: `utils/folder/` (`find-folder.ts`, `folder-tree.ts`), `utils/photo/` (`album-photo.ts`, `format-file-size.ts`, `format-resolution.ts`, `media-file-url.ts`), and `utils/preview/` (`preview-zoom.ts`, `thumbnail-columns.ts`), each with a barrel `index.ts`. `is-editable-keyboard-target.ts` stays at the root — it's a generic DOM helper, not photo-domain. The root `utils/index.ts` barrel re-exports everything, so existing `#/utils` imports are unaffected.

## [1.7.12] - 2026-09-15

### Changed

- Grouped `utils/format-metadata-value.ts`, `utils/group-metadata.ts`, and `utils/photo-overview.ts` into `utils/metadata/` with a barrel export, part of splitting the flat `utils/` directory by area of work.

## [1.7.11] - 2026-09-15

### Changed

- `AppLayout`, `CullDetails`, `CullScreen`, `PreferencesAppearance`, and `PreferencesDialog` now use `function` declarations instead of arrow function expressions, completing the codebase-wide conversion for React components.

## [1.7.10] - 2026-09-15

### Changed

- Media screen and folder browser components (`MediaScreen`, `MediaAlbums`, `MediaBrowser`, `MediaBrowserFolderItem`, `MediaBrowserFolderTree`, `MediaBrowserListFolder`, `MediaBrowserList`, `MediaBrowserThumbnailFolder`, `MediaBrowserThumbnails`, `MediaBrowserToolbar`) now use `function` declarations instead of arrow function expressions.

## [1.7.9] - 2026-09-15

### Changed

- Photo shared components (`PhotoContextMenu`, `PhotoListHeader`, `PhotoListRow`, `PhotoListShell`, `PhotoRatingStars`, `PhotoThumbnailShell`, `PhotoThumbnailTile`, `PhotoMetadata`, `PhotoMetadataOverview`, `PhotoPreview`, `PhotoPreviewToolbar`, `PhotoPreviewFullscreen`) now use `function` declarations instead of arrow function expressions.

## [1.7.8] - 2026-09-15

### Changed

- Album/title-bar shared components (`AlbumFormDialog`, `AlbumPhotoList`, `AlbumPhotoThumbnails`, `AlbumPhotoToolbar`, `AlbumSidebarRow`, `AlbumSidebarShell`, `AppTitleBar`) now use `function` declarations instead of arrow function expressions, matching the codebase convention.

## [1.7.7] - 2026-09-15

### Changed

- Renamed `components/media-photo-list/` to `components/photo-list/` (`MediaPhotoListHeader` → `PhotoListHeader`, `MediaPhotoListRow` → `PhotoListRow`, `MediaPhotoListShell` → `PhotoListShell`, `MediaPhotoThumbnailShell` → `PhotoThumbnailShell`, `MediaPhotoThumbnailTile` → `PhotoThumbnailTile`). It's a generic photo grid/list primitive consumed by the folder browser and both album grids, not Media-specific — the leftover "Media" prefix was inconsistent with its sibling shared components (`photo-preview`, `photo-metadata`, `photo-context-menu`).

## [1.7.6] - 2026-09-15

### Changed

- Moved `modules/media/media-metadata/` to `components/photo-metadata/` (`PhotoMetadata`, `PhotoMetadataOverview`), since it's shared between the Cull and Media screens rather than Media-specific.

## [1.7.5] - 2026-09-15

### Changed

- Renamed the Albums workspace module to Cull: `modules/albums/` → `modules/cull/` (`AlbumsScreen` → `CullScreen`, `AlbumsDetails` → `CullDetails`), route `/albums` → `/cull`, and the title bar tab label. The Album domain (`shared/album.ts`, `stores/album.store.ts`, `types/album.ts`, `main/ipc/albums.ts`) and the Media screen's album panel are unchanged.

## [1.7.4] - 2026-09-15

### Changed

- Extracted `components/album-photo-toolbar/` (`AlbumPhotoToolbar`) and `components/album-photo-grid/` (`AlbumPhotoList`, `AlbumPhotoThumbnails`), replacing the duplicated per-module list/thumbnail/toolbar components. The toolbar's leading slot and zoom separator, and the grid's layout and rating column, are now props instead of forked components.

## [1.7.3] - 2026-09-15

### Changed

- Extracted `components/album-sidebar/` (`AlbumSidebarShell`, `AlbumSidebarRow`), replacing the duplicated per-module album sidebar and row components.

## [1.7.2] - 2026-09-15

### Changed

- Extracted `components/photo-context-menu/` (`PhotoContextMenu`) and `components/album-form-dialog/` (`AlbumFormDialog`), replacing the duplicated per-module context menu and add/rename-album dialog components.

## [1.7.1] - 2026-09-15

### Changed

- Extracted `components/photo-preview/` (`PhotoPreview`, `PhotoPreviewToolbar`, `PhotoPreviewFullscreen`) shared between the Media and Albums screens, replacing the duplicated `media-preview` / `albums-preview` module pairs.

## [1.7.0] - 2026-09-15

### Added

- Albums workspace shows the selected photo's metadata under the album list, in a resizable pane.

## [1.6.0] - 2026-09-15

### Changed

- Metadata overview shows exposure and file cards (aperture, shutter, white balance, ISO, size, color space, resolution) instead of a labeled grid.
- Compact `WxH` metadata values format with spaces around `x`.

## [1.5.1] - 2026-09-15

### Fixed

- Unrated album thumbnails keep a spacer so filenames still line up with rated tiles.

## [1.5.0] - 2026-09-15

### Added

- Album lists in Media and Albums show a folder icon that fills when the album is selected.

## [1.4.1] - 2026-09-15

### Changed

- Remaining renderer views import `cn` from the local helper instead of the `cn` package.

## [1.4.0] - 2026-09-15

### Added

- Album photos store a 0–5 star rating; the Albums workspace list adds a Rating column and thumbnails show stars under the preview when a photo is selected or already rated (Media albums pane stays unrated).

### Fixed

- Long album names in the albums sidebar truncate with an ellipsis.
- Album thumbnail strips top-align tiles so filenames line up when some photos show rating controls.

## [1.3.3] - 2026-09-15

### Changed

- GitNexus CLI is 1.6.12.

## [1.3.2] - 2026-09-15

### Changed

- Album details toolbar separates the thumbnail size slider from the list and thumbnail view toggles.

## [1.3.1] - 2026-09-15

### Changed

- Album photo context menus type their trigger children through `PropsWithChildren`.

## [1.3.0] - 2026-09-15

### Changed

- Album details thumbnails scroll horizontally as a sized strip instead of wrapping in a grid.
- The albums workspace gives more height to the preview and keeps the photo list in a shorter pane.

## [1.2.6] - 2026-09-14

### Fixed

- Preview zoom follows trackpad pinch distance, and the preview image is isolated so panzoom updates do not remount it.

## [1.2.5] - 2026-09-14

### Fixed

- File-list column headers stay pinned while the photo rows scroll in the media browser, albums pane, and albums workspace.

## [1.2.4] - 2026-09-14

### Fixed

- Any folder in the media browser tree can collapse, including the selected one, without closing nested folders that were already expanded.

## [1.2.3] - 2026-09-14

### Changed

- Tiny type uses a 24px line height, and file-list rows match that size.
- Vite resolves `cn` through the renderer helper so `text-tiny` merges with other font-size classes.

### Fixed

- Selected thumbnail names use the foreground color.

## [1.2.2] - 2026-09-14

### Fixed

- GitNexus analyze installs locally so pnpm can run its native build scripts.

## [1.2.1] - 2026-09-14

### Changed

- The media album name sits on the photo pane header, and toolbars use the shared tiny type size.

## [1.2.0] - 2026-09-14

### Added

- Albums tab in the title bar opens a dedicated albums workspace.

## [1.1.0] - 2026-09-14

### Added

- Album sidebar, details, and preview panes for a dedicated albums workspace.

## [1.0.1] - 2026-09-14

### Added

- Right-click an album photo to remove it from the album.
- Metadata overview columns follow the metadata pane width.

### Changed

- Folder listings map into the shared photo item type.

## [1.0.0] - 2026-09-13

First public release. Browse your photo library and build albums.

### Changed

- Product copy is now "Browse your photo library and build albums."
- The title bar only lists the Media workspace.

### Removed

- Standalone Photos and Albums screens. Browsing and albums share the Media workspace.

## [0.35.0] - 2026-09-13

### Added

- Arrow keys move the photo selection in the focused library or album pane, including full screen.

## [0.34.0] - 2026-09-13

### Added

- Cmd/Ctrl+F shows the selected photo on the full display.

## [0.33.0] - 2026-09-13

### Added

- Preview zoom shows the current percent when it is not a preset.

## [0.32.0] - 2026-09-13

### Added

- Photos can be dragged from one album to another.

## [0.31.0] - 2026-09-13

### Added

- Media workspace panes can be resized, and preview and metadata fill their panels.

## [0.30.0] - 2026-09-13

### Added

- Album workspace shows list and thumbnail views with a resizable album sidebar.

### Changed

- Replace the album photo grid with shared list and thumbnail chrome.

## [0.29.0] - 2026-09-13

### Added

- Media browser list and thumbnail views share the photo chrome, with a resizable folder tree.

## [0.28.0] - 2026-09-13

### Added

- Shared photo list and thumbnail tiles for the media browser and albums.

## [0.27.3] - 2026-09-13

### Changed

- Add resizable panel primitives for splitting the media workspace.

## [0.27.2] - 2026-09-13

### Changed

- Add a GitNexus analyze script and allow its native dependencies to build under pnpm.

## [0.27.1] - 2026-09-13

### Changed

- Bundle renderer, main, and preload as esnext for the Electron runtime.

## [0.27.0] - 2026-09-13

### Added

- Album pane shows a thumbnail grid, create/rename dialog, and drag-and-drop from the file list.

## [0.26.0] - 2026-09-13

### Added

- Albums persist photo records and accept new photos over IPC.

### Changed

- Existing album rows migrate the `photo_ids` column to `photos`.

## [0.25.1] - 2026-09-13

### Changed

- Add context menu, field, and label UI primitives.

## [0.25.0] - 2026-09-13

### Added

- Failed main-process requests show an error toast in the app layout.

## [0.24.4] - 2026-09-13

### Changed

- Remove the standalone media file-list, folder-tree, and toolbar modules.

## [0.24.3] - 2026-09-13

### Changed

- Media browser keeps its file list, folder tree, and toolbar in the same module.

## [0.24.2] - 2026-09-13

### Changed

- Add drag-and-drop, Formisch, and Valibot dependencies for album editing.

## [0.24.1] - 2026-09-13

### Changed

- Media toolbar shows a thumbnail-size slider in grid view and labels the list and thumbnail buttons.

## [0.24.0] - 2026-09-13

### Added

- RAW files (NEF, ARW, CR2, and similar) show their embedded JPEG preview in the photo pane.

## [0.23.0] - 2026-09-13

### Changed

- Media file list header and rows share compact cell spacing, with resizable columns for date, size, and resolution.

## [0.22.0] - 2026-09-13

### Added

- Folder listings include each photo's created date, file size, and pixel dimensions.

## [0.21.0] - 2026-09-13

### Changed

- Media albums sidebar loads, creates, and selects albums from the persisted album store.

## [0.20.0] - 2026-09-13

### Added

- User-created albums persist in SQLite in the app user data folder.

## [0.19.2] - 2026-09-13

### Changed

- Media screen extracts the folder tree, toolbar, and file list into a `MediaBrowser` pane.

## [0.19.1] - 2026-09-12

### Fixed

- Metadata group headings stay opaque while tags scroll underneath, including at the top of the list.

## [0.19.0] - 2026-09-12

### Changed

- File list virtualizes folder and photo rows so large folders stay responsive.

## [0.18.0] - 2026-09-12

### Changed

- Folder sidebar virtualizes rows with react-arborist so large expanded folders stay responsive.

## [0.17.1] - 2026-09-12

### Changed

- Media toolbar overflow menu aligns to the end of its trigger.

## [0.17.0] - 2026-09-12

### Added

- Photo preview supports pan, pinch-zoom, two-finger scroll, and preset zoom levels (Fit through 300% actual size).

## [0.16.0] - 2026-09-12

### Added

- Metadata pane shows a compact EXIF overview (ISO, shutter, aperture, white balance, format, resolution, color space) above the grouped tags.

### Changed

- Photo EXIF reads go through a shared renderer hook with request coalescing.

## [0.15.2] - 2026-09-12

### Changed

- File list, folder tree, preview URLs, and folder lookup use renderer `constants` and `utils` instead of inline values and `#/lib`.

## [0.15.1] - 2026-09-12

### Changed

- Media metadata grouping, date formatting, and grid thumbnail sizing live in renderer `constants` and `utils` instead of the view components.

## [0.15.0] - 2026-09-12

### Added

- Media screen metadata pane groups ExifTool tags by prefix and formats timestamps as readable dates.

### Changed

- Media layout is a two-by-two grid so preview and metadata sit beside the folder browser and albums.

## [0.14.0] - 2026-09-12

### Added

- Main process reads photo EXIF with ExifTool and exposes it to the renderer over IPC.

## [0.13.0] - 2026-09-12

### Added

- Local photo previews load through a privileged `meta-rolls-media` protocol so disk files can render in the viewer.

## [0.12.1] - 2026-09-12

### Changed

- Import `cn` from the `cn` package instead of a local re-export, and ignore TypeScript `*.tsbuildinfo` files.

## [0.12.0] - 2026-09-12

### Changed

- Album grid shows an empty state, and folder-tree / file-list selection chrome uses filled icons and accent highlighting.

## [0.11.0] - 2026-09-12

### Changed

- Media sidebar lists albums instead of library filters, and the file list can highlight a folder without opening it.

## [0.10.0] - 2026-09-12

### Added

- Preferences dialog with appearance settings: persisted theme (including system) and language preference.

## [0.9.0] - 2026-09-12

### Added

- App menu Preferences item (⌘/,) that notifies the renderer to open preferences.

## [0.8.2] - 2026-09-12

### Added

- shadcn Card, Dialog, Select, Toggle, and Toggle Group primitives for upcoming preferences UI.

## [0.8.1] - 2026-09-12

### Changed

- Format source with Oxfmt instead of Biome, including sorted imports.
- Editor setup uses the Oxc formatter (`js/ts.format.enabled`) instead of Biome.

### Fixed

- Sidebar toggle no longer shadows the outer `open` state.
- `useIsMobile` reads viewport size through `useSyncExternalStore` instead of `setState` in an effect.

## [0.8.0] - 2026-09-12

### Changed

- Albums screen reads and updates album list state from the album store.

## [0.7.0] - 2026-09-12

### Changed

- Media browser lists volumes and folders from disk instead of mock data.

## [0.6.0] - 2026-09-12

### Added

- Zustand stores for the photo pool, albums, canvas slots, and settings, with settings hydrated over IPC.

## [0.5.0] - 2026-09-12

### Added

- Renderer domain types, const enums, and constants under `src/renderer/src/types` and `src/renderer/src/constants`.

## [0.4.0] - 2026-09-12

### Added

- Main-process IPC to list disk volumes and folders, and to persist settings in `userData/config.json`.

## [0.3.0] - 2026-09-12

### Changed

- App icon uses `resources/icon.png` in the title bar, favicon, dock, and About panel. Packaged macOS icons are generated into `build/icon.icns`.

## [0.2.1] - 2026-09-12

### Added

- GitNexus indexing config, ignored generated skill copies, and agent commit/versioning rules.

## [0.2.0] - 2026-09-12

### Added

- Media viewer and album pool so selected photos can be previewed and browsed as thumbnails.

## [0.1.0] - 2026-09-12

### Added

- Media storage browser with a collapsible disk list, current location in the toolbar, and folder/file listing.

## [0.0.0] - 2026-09-12

### Added

- Electron + React + TypeScript desktop shell with Vite, TanStack Router, and Shadcn UI.
- App layout with Media, Photos, and Albums routes.
