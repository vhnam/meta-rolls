# Release readiness review — 2026-09-23

Findings from a full-codebase review (security, architecture, cache, UI/UX) done before a
first public release. Checked items are done; the rest is the work queue.

## My mistakes from earlier in this session

- [x] **Commit trailers.** AGENTS.md forbids `Co-Authored-By` trailers in commits. I added
      one to 11 commits already pushed to `origin/feat/deliver`. Fixing this means rewriting
      those 11 commits and force-pushing — needs your explicit go-ahead since it rewrites
      pushed history.
      Fixed: by the time this ran, 16 commits actually carried the trailer (more had landed
      since this note was written). Rewrote `884e436..HEAD` (20 commits touched, 16 of them
      content-changed) with a `git filter-branch --msg-filter` that only strips the exact
      `Co-Authored-By: Claude Sonnet 5 <...>` line — verified `884e436` itself, which just
      _mentions_ "Co-Authored-By" in its body explaining this rule, was correctly left alone.
      Confirmed identical file trees before/after (`git diff` empty), zero trailer matches
      left, then force-pushed with `--force-with-lease`. A local-only backup branch,
      `backup/before-trailer-cleanup`, still points at the old tip.
- [x] **Bundle size claim was wrong.** I said the ~98 MB asar was "legitimately exiftool".
      It's actually dominated by shipped developer tooling (`.gitnexus`, etc.) — see Blocker 1.
- [x] **Cache correctness claim was wrong.** My immutable-cache commit says the `v` param
      "changes whenever the file's content changes." It doesn't — `v` is `0` until the photo
      is rotated inside the app. Editing a file in another app while Meta Rolls is open can
      leave a stale cached image showing until restart. Fix: derive `v` from the file's mtime
      (already returned by `listFolder`/`FileEntry`) instead of only the in-app rotation
      counter.
      Fixed: `FileEntry`/`MediaFileEntry`/`PhotoItem` now carry `mtimeMs` from the folder
      scan; `resolvePhotoRevision` prefers the in-app rotation counter when present, else
      falls back to that mtime, at all 5 selector call sites. Still only refreshed on the
      next folder scan (no live file-watching) — and album-derived `PhotoItem`s (Deliver
      canvas, album grid) still have no `mtimeMs` since `AlbumPhoto` doesn't persist one,
      so they keep relying solely on the in-app rotation counter as before.
- [x] **Refactor claim was imprecise.** I called the `image-decode.ts` extraction
      behavior-preserving. It isn't quite: RAW previews now also run through the
      already-baked-orientation check that previously only applied to non-RAW files. Low
      risk, but worth a second look.
      Turned out to be a real bug, not just imprecise: the check compares the extracted RAW
      preview JPEG's dimensions against the RAW _container's_ header dimensions — those
      aren't the same frame of reference (the preview is usually a different resolution than
      the sensor data), so the comparison could spuriously match and skip rotation on a
      portrait RAW photo that needed it. Fixed: `isOrientationAlreadyBaked` now short-circuits
      to `false` for RAW files, restoring the pre-refactor behavior of always rotating RAW
      previews unconditionally. `thumbnail.ts` shares the same function, so this also fixes
      RAW thumbnails.

## Blockers (must fix before release)

- [x] **1. Installer ships developer folders.** Of the 101 MB `app.asar`, ~83 MB is
      `.gitnexus` (a full source index), plus `.agents`, `.claude`, `.cursor`,
      `.pnpm-store`, `AGENTS.md`, `CLAUDE.md`, `*.tsbuildinfo`, and sourcemaps. The actual
      app is ~30 MB. Fix: switch `electron-builder.yml`'s `files` from a denylist to an
      allowlist — only `out/**` (excluding `.map`), `resources/**`, `package.json`.
      Fixed: allowlist now also lists `node_modules/**/*` explicitly (a custom `files` list
      disables electron-builder's automatic inclusion). Verified packaged asar ~7.3 MB +
      ~21 MB unpacked exiftool.
- [x] **2. Likely crash/infinite-loop on first launch.** `media-screen.tsx`, `cull-screen.tsx`,
      and `deliver-screen.tsx` all select
      `state.albums.find((album) => album.id === activeAlbumId)?.photos ?? []` — a fresh `[]`
      on every call when there's no active album. Under Zustand v5 (`useSyncExternalStore`),
      that's a known infinite-re-render trigger. A brand-new install (no albums yet) hits
      this exact path. Verify by launching against an empty userData dir; fix with a shared
      module-level empty-array constant instead of `?? []` inline.
      Fixed: shared `selectActiveAlbumPhotos` selector backed by one stable empty-array
      constant in `album.store.ts`, used by all three screens.
- [ ] **3. None of this session's main-process changes have been run in a real window.**
      This sandbox can't launch Electron with a display. Sandbox mode, the navigation guard,
      dev-only menu gating, thumbnail generation, and immutable caching are type-checked and
      built only — need a manual smoke test of the packaged app.
- [ ] **4. No code signing / notarization.** `notarize: false`, no signing identity. Other
      Macs will refuse to open the app ("damaged"). Needs your Apple Developer account.
- [x] **5. No top-level error boundary.** Any render error white-screens with no recovery.
      Fixed: `router.tsx`'s `defaultErrorComponent` (`AppErrorFallback`).

## Security (open items)

- [x] `mediaRotateImage` IPC handler runs an exiftool write against any path the renderer
      sends, with no image-extension check (unlike the media protocol, which now has one).
      Fixed: `assertImagePath` in `ipc/media.ts`, applied to both `mediaReadExif` and
      `mediaRotateImage`.
- [x] `pdf-export.ts`'s `readDisplayBytes(slot.path)` call has the same gap — no extension
      check before reading/encoding whatever path is in the print request.
      Fixed: the `isImageFile` check moved inside `readDisplayBytes` and `readThumbnailBytes`
      themselves, so every caller (protocol handler and pdf-export.ts) is covered.
- [x] The `will-navigate` guard added this session allows any `file:` URL in production —
      should be scoped to the app's own `index.html` specifically.
      Fixed: compares the navigated URL's pathname against the app's actual entry file path.
- [x] `bypassCSP: true` on the `meta-rolls-media` scheme registration is likely no longer
      needed now that `index.html`'s CSP already allowlists `meta-rolls-media:` in `img-src`.
      Fixed: removed.

## Architecture

- [ ] `src/main/services/pdf-export.ts` creates a `BrowserWindow` and imports from `app/` —
      violates the AGENTS.md rule that `services/` holds pure Node logic with no Electron
      APIs. Should move under `app/` or `main/` directly, or the rule should be updated if
      this is accepted as a deliberate exception.
- [ ] AGENTS.md's file tree is stale: missing the Deliver module, `ipc/deliver.ts`,
      `services/pdf-export.ts`, `shared/print.ts`, `app/apply-exif-orientation.ts`. (My
      thumbnail-feature commit already patched in the 3 files I added; the pre-existing gaps
      remain.)
- [ ] No tests anywhere in the repo. `shared/print.ts` (page/folio layout, rotation math) is
      pure and easy to unit test — good first target.
- [ ] `DeliverScreen` calls `useMediaPoolStore()` with no selector, so it re-renders on every
      store change instead of just the slices it needs.

## Cache / performance

- [x] Thumbnail disk cache eviction (`thumbnail-cache.ts`) does a full `readdir` + `stat` on
      every file once the cache exceeds ~2000 entries, on every write past that point. Fine
      at current scale; would want a smarter/batched approach if the cache grows much larger.
      Fixed: added hysteresis — pruning only triggers once the cache is 400 entries over the
      cap (`PRUNE_TRIGGER_ENTRIES`), and then trims back down to the 2000 cap in one batch.
      The cheap `readdir` still runs every write, but the expensive per-file `stat` pass now
      runs roughly once every 400 writes instead of every write past the cap. Verified with a
      standalone script (this module has no Electron dependency) simulating 2500 writes: the
      count grows freely from 2000→2400, drops to 2000 in one batch, repeats.
- [x] Otherwise reasonable: resize-before-rotate ordering, in-flight request de-dup, mtime-keyed
      cache entries.

## UI/UX

Only reviewed via code reading — could not run the app in this environment.

- [x] Error toasts surface Electron's raw IPC error text (`Error invoking remote method
'…': Error: …`) instead of a clean message.
      Fixed: `use-ipc.ts`'s `toMessage` strips Electron's `Error invoking remote
  handler/method '<channel>': Error: ` wrapper before showing the message. Note: I
      could not run a real IPC rejection in this sandbox to confirm the exact wrapper text
      Electron 44 produces — the regex is written from well-documented Electron behavior
      that's been stable across versions, and the fallback is safe either way (a
      non-matching message just passes through unchanged, same as before this fix).
- [x] `BrowserWindow` has no `minWidth`/`minHeight` — resizable panels can be dragged into an
      unusable layout.
      Fixed: `minWidth: 760, minHeight: 480` in `index.ts`'s `createWindow`.
- [x] Empty states exist for albums (`Empty`/`EmptyMedia`/`EmptyDescription`); first-run flow
      as a whole hasn't been visually verified.
      Code-reviewed (not visually verified — still can't run a display here): on first
      launch `loadVolumes()` auto-selects the first disk volume as the active folder rather
      than leaving nothing selected, an empty/no-match folder shows "No files in this
      folder." (`PhotoThumbnailShell`'s `isEmpty`/`emptyMessage`), the Albums pane shows "No
      albums yet" / "Select an album to view its photos", and `PhotoPreview` branches
      cleanly on `photo === null`. No bugs found, but this is still not a substitute for
      actually launching a fresh install.

## Suggested order

1. [x] Blockers 1, 2, 5 + the two extension-check gaps + the `file:` navigation scoping.
2. [ ] Manual smoke test of a packaged build from a clean userData folder. **Needs you** —
       this sandbox can't launch Electron with a display.
3. [x] Fix the `v`-param cache-correctness issue (derive from file mtime).
4. [ ] Code signing / notarization. **Needs you** — Apple Developer account.
5. [x] Rewrite commits to drop `Co-Authored-By` trailers (force-pushed).

### Still open, not in the original numbered list

- `src/main/services/pdf-export.ts`'s `services/` + Electron-API layering violation.
- AGENTS.md's stale file tree (Deliver module, `ipc/deliver.ts`, `services/pdf-export.ts`,
  `shared/print.ts`, `app/apply-exif-orientation.ts`).
- No tests anywhere in the repo.
- `DeliverScreen`'s unselected `useMediaPoolStore()` call.

The thumbnail cache eviction item (Cache/performance section) is now `[x]` — fixed with
batched pruning. All three UI/UX items (raw IPC error text, window min-size, first-run flow)
are now `[x]` above — the first-run item is code-reviewed only, still not visually verified. The
`image-decode.ts` RAW-orientation item is also `[x]` above (it was a real bug, fixed).
