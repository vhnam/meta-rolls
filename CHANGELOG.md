# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The project starts at **0.0.0**. While the MVP is in development, versions bump **minor** for features and **patch** for everything else.

## [Unreleased]

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
