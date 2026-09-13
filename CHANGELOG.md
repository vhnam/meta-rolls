# Changelog

All notable changes to Meta Rolls are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-14

### Added

- Right-click an album photo to remove it from the album.
- Metadata overview columns follow the metadata pane width.

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
