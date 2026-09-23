# Release readiness review — 2026-09-23

Findings from a full-codebase review (security, architecture, cache, UI/UX) done before a
first public release. Checked items are done; the rest is the work queue.

## My mistakes from earlier in this session

- [ ] **Commit trailers.** AGENTS.md forbids `Co-Authored-By` trailers in commits. I added
      one to 11 commits already pushed to `origin/feat/deliver`. Fixing this means rewriting
      those 11 commits and force-pushing — needs your explicit go-ahead since it rewrites
      pushed history.
- [x] **Bundle size claim was wrong.** I said the ~98 MB asar was "legitimately exiftool".
      It's actually dominated by shipped developer tooling (`.gitnexus`, etc.) — see Blocker 1.
- [ ] **Cache correctness claim was wrong.** My immutable-cache commit says the `v` param
      "changes whenever the file's content changes." It doesn't — `v` is `0` until the photo
      is rotated inside the app. Editing a file in another app while Meta Rolls is open can
      leave a stale cached image showing until restart. Fix: derive `v` from the file's mtime
      (already returned by `listFolder`/`FileEntry`) instead of only the in-app rotation
      counter.
- [ ] **Refactor claim was imprecise.** I called the `image-decode.ts` extraction
      behavior-preserving. It isn't quite: RAW previews now also run through the
      already-baked-orientation check that previously only applied to non-RAW files. Low
      risk, but worth a second look.

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
- [ ] **5. No top-level error boundary.** Any render error white-screens with no recovery.

## Security (open items)

- [ ] `mediaRotateImage` IPC handler runs an exiftool write against any path the renderer
      sends, with no image-extension check (unlike the media protocol, which now has one).
- [ ] `pdf-export.ts`'s `readDisplayBytes(slot.path)` call has the same gap — no extension
      check before reading/encoding whatever path is in the print request.
- [ ] The `will-navigate` guard added this session allows any `file:` URL in production —
      should be scoped to the app's own `index.html` specifically.
- [ ] `bypassCSP: true` on the `meta-rolls-media` scheme registration is likely no longer
      needed now that `index.html`'s CSP already allowlists `meta-rolls-media:` in `img-src`.

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

- [ ] Thumbnail disk cache eviction (`thumbnail-cache.ts`) does a full `readdir` + `stat` on
      every file once the cache exceeds ~2000 entries, on every write past that point. Fine
      at current scale; would want a smarter/batched approach if the cache grows much larger.
- [x] Otherwise reasonable: resize-before-rotate ordering, in-flight request de-dup, mtime-keyed
      cache entries.

## UI/UX

Only reviewed via code reading — could not run the app in this environment.

- [ ] Error toasts surface Electron's raw IPC error text (`Error invoking remote method
'…': Error: …`) instead of a clean message.
- [ ] `BrowserWindow` has no `minWidth`/`minHeight` — resizable panels can be dragged into an
      unusable layout.
- [ ] Empty states exist for albums (`Empty`/`EmptyMedia`/`EmptyDescription`); first-run flow
      as a whole hasn't been visually verified.

## Suggested order

1. Blockers 1, 2, 5 + the two extension-check gaps + the `file:` navigation scoping —
   small, no trailer concerns.
2. Manual smoke test of a packaged build from a clean userData folder.
3. Fix the `v`-param cache-correctness issue (derive from file mtime).
4. Code signing / notarization (needs your Apple Developer account).
5. Decide on rewriting the 11 commits to drop `Co-Authored-By` trailers (force-push).
