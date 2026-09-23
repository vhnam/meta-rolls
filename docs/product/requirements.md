# Meta Rolls — Requirements

This document is for people. It explains **why** Meta Rolls exists, **who** it is for, **what** it
must do, what it deliberately does **not** do, and **why** it is built the way it is.
Instructions for coding agents live in [AGENTS.md](../../AGENTS.md). The two files have different jobs.
Keep build commands and file layout there, and keep purpose and decisions here.

Last updated: 2026-09-24 (app version 3.9.12).

---

## 1. Purpose and background

### Why we are building this

Making a printed Instax album means switching between several tools, and none of them suits the job:

- **A file browser** (Finder, Explorer) to find the shoot on a card or drive. It can't preview most
  RAW files well and shows no EXIF details.
- **A culling or catalogue tool** (Lightroom, Photo Mechanic) to pick keepers. These are heavy,
  want you to _import_ everything into a catalogue, and know nothing about Instax.
- **A layout tool** (InDesign, Canva, a word processor) to lay out prints at exact Instax sizes.
  Here the user calculates card borders by hand, re-exports every photo as a JPEG, and guesses at
  page order for a folded book.

Every handoff costs time, and the layout step is error-prone: wrong print size, crops that fall
under the thick bottom border, and page numbers that don't match the folded book.

### What we want to solve

One lightweight desktop app that goes from **"photos on a card" to "a PDF I can print"** without
importing, converting, or measuring anything by hand. Its three workspaces follow the steps a
photographer already takes:

1. **Media**: look through the photos where they already are.
2. **Cull**: collect the good ones into albums and rate them.
3. **Deliver**: lay the album out as real-size Instax prints in book spreads and export a PDF.

## 2. Who uses it

### Primary user

A **hobbyist or semi-professional photographer** who shoots digital (often RAW), then prints a
selection on **Instax Mini or Instax Wide** film or on paper at Instax size, to make small photo
albums, zines, or gifts.

- Shoots events, travel, friends, and family, usually a few hundred frames at a time on one card.
- Already keeps photos in dated folders on internal or external disks and doesn't want another
  catalogue to maintain.
- Cares how the printed result looks: an exact crop inside the Instax frame and a correct page order.
- Uses macOS mostly, sometimes Windows. Works offline, often straight from the card.
- Prefers English or Vietnamese.

### What frustrates them today

- "I have to import 400 photos into Lightroom just to pick 20."
- "My RAW files won't preview, so I export JPEGs first just to look at them."
- "I lay out Instax cards in Canva and every time the photo ends up under the bottom border."
- "When I fold the pages, the numbers and the order come out wrong."

### Typical session

> Back from a weekend trip, Linh inserts the SD card and opens Meta Rolls. The card shows up in
> the folder tree, and they flip through the RAW files with the arrow keys, checking focus at 100%
> zoom. They drag about 40 keepers into a new album called "Da Lat". The next evening, in **Cull**,
> they rate each photo and remove the weakest until 16 remain. In **Deliver** they choose Instax
> Mini on A4, nudge two crops so faces sit clear of the border, rotate one landscape shot, turn on
> page numbers, and export a PDF to take to the print shop.

## 3. Features and priorities

### Must have (the product doesn't work without these)

**Browsing (Media)**

- Browse every mounted disk and card in a folder tree. Photos are read where they sit, with no
  import or copy.
- Recognize everyday formats (JPEG, PNG, HEIC, TIFF, WebP, …) **and camera RAW** (Canon, Nikon,
  Sony, Fujifilm, Olympus, Panasonic, Pentax, Leica/DNG, and more).
- List view and thumbnail view, search within the folder, and arrow-key navigation.
- A large preview with zoom and pan, plus full screen.
- EXIF details for the selected photo: aperture, shutter, ISO, white balance, size, resolution, and color space.
- Rotate a photo 90° in either direction (the file is marked with the new orientation).
- Reopen the same folders on the next launch.

**Albums and culling (Cull)**

- Create, rename, and delete albums. Add photos by dragging, move them between albums, and remove them.
- Give photos a 0–5 star rating inside an album.
- A culling screen: album list, large preview, a photo strip or list, and EXIF details.
- Albums and ratings survive restarts.

**Print layout (Deliver)**

- Real Instax sizes: **Mini** (card 54×86 mm, picture 46×62 mm) and **Wide** (card 108×86 mm,
  picture 99×62 mm), with the thicker bottom border drawn as on the film.
- Place prints on **A4, A5, or Letter**, or on a page the size of the card itself.
- A book-spread layout (two pages, two prints per page) that fills from the album automatically,
  with drag-to-place and swap.
- For each print: fill or fit, crop position and zoom, and 90° rotation.
- Book settings: whether the first page is on the left or the right, optional page numbers, and
  rotation of the whole spread.
- **Export a print-ready PDF** at full photo resolution, then open it straight from the app.
- Print settings are saved with each album.

**Across the app**

- Light, dark, and system themes.
- Works fully offline. Safe to run on a disk full of personal photos (see §6).

### Nice to have (valuable, but not blocking a first public release)

- **Save the layout itself.** Crops, per-print rotation, and manual placement are currently lost when
  the app restarts. Only album print settings are saved. _This is the most-wanted item._
- **Vietnamese interface.** The language setting exists, but no text is translated yet.
- **Reorder and remove spreads** in the Deliver spreads strip. Today you can only add one or pick one.
- **Flag missing photos** when an album refers to a file that was moved or deleted.
- **Live refresh** when a photo is edited in another app. Today it refreshes on the next folder scan.
- Automatic updates.
- Filtering and sorting by rating in Cull.

### Not doing this time (and why)

| Not building                                 | Why                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Importing or copying photos into a library   | The main promise is "leave my files where they are". A catalogue would bring back the tool we're replacing.        |
| Photo editing (exposure, color, retouching)  | Users already have an editor. Meta Rolls selects and lays out; it doesn't develop.                                 |
| Sending jobs to a printer or the Instax app  | A PDF works with any print shop or home printer. Printer drivers and Instax Bluetooth are out of scope.            |
| Cloud sync, accounts, sharing                | Single user, offline, private. Syncing adds servers, privacy work, and cost with no benefit for the core workflow. |
| Layouts other than 2-per-page book spreads   | Instax albums use this format. Free-form layout is what Canva and InDesign are for.                                |
| Other film formats (Instax Square, Polaroid) | Keeps the first release focused. The size tables make them easy to add later.                                      |
| Video                                        | The product is about prints.                                                                                       |

## 4. Tools and why we chose them

_Reasons below come from the changelog and code history. Where no reason was recorded, the most
likely one is given and marked (inferred). Correct these when needed._

| Area                   | Choice                                                   | Why this and not the alternative                                                                                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell              | **Electron**                                             | Needs direct disk access (every volume, RAW files) and must run on macOS and Windows from one codebase. A web app can't read the disk. Electron's bundled Chromium renders the print layout to PDF identically on every OS.                                           |
| RAW and EXIF           | **exiftool** (`exiftool-vendored`)                       | Covers far more camera RAW formats and EXIF fields than any JavaScript library, can pull the embedded preview from RAW files, and can write the orientation tag. It is the biggest part of the installer (about 21 MB), which is accepted as the cost of RAW support. |
| Image size             | **image-size**                                           | Reads width and height from the file header without decoding the whole image, which keeps big folders fast.                                                                                                                                                           |
| Local data             | **SQLite built into Node** (`node:sqlite`)               | Albums and ratings need reliable local storage. The built-in module avoids a native add-on that would have to be rebuilt for every Electron and OS version (inferred).                                                                                                |
| Settings               | JSON file with locking and atomic writes                 | Settings are small, so a database would be overkill. Locking and write-then-rename fixed a real bug where concurrent saves corrupted the file.                                                                                                                        |
| PDF output             | Chromium's print-to-PDF in a hidden window               | Draws the layout with the same HTML and CSS the user sees on screen, so export matches the preview. No separate PDF layout engine to maintain.                                                                                                                        |
| UI                     | **React**, **TanStack Router**, **Zustand**              | A widely known stack. Type-safe routes for the three workspaces. Zustand keeps state per screen with little boilerplate (inferred).                                                                                                                                   |
| Components and styling | **shadcn/ui** (Base UI) + **Tailwind CSS v4**            | Accessible building blocks that live in our own code, and a single theme for light and dark. A lint rule keeps components from being restyled one-off.                                                                                                                |
| Interaction            | dnd-kit, panzoom, react-resizable-panels, react-arborist | Proven libraries for the four interactions the app depends on: drag to album or slot, zoom and pan, resizable panes, and a large folder tree (inferred).                                                                                                              |
| Tooling                | pnpm, Vite, oxlint + oxfmt, Vitest, lefthook             | Fast builds and checks. A pre-commit hook formats, lints, and tests.                                                                                                                                                                                                  |

## 5. Design direction

- **Feel:** a quiet, tool-like workspace where the photos stand out. It is dense like a pro photo
  tool, but not cluttered.
- **Colors:** neutral grey backgrounds with a warm **orange/amber** accent (a nod to film and
  Instax packaging). Dark and light themes are equally supported. Dark suits judging photos.
- **Type:** Geist Mono for body text, Space Grotesk for headings, JetBrains Mono for data. The
  monospace gives a technical, metadata-first character.
- **Layout:** every workspace is made of resizable panes. Navigation is a slim tab bar at the
  bottom (Media · Cull · Deliver). Panels that aren't needed can be collapsed.
- **Keyboard-first where it counts:** arrow keys to move between photos, **Z** to fit, ⌘/Ctrl+F
  for full screen, ⌘/Ctrl+[ and ] to rotate, ⌘/Ctrl+, for Preferences.

## 6. Schedule and constraints

### Where we are

- The core flow (Media → Cull → Deliver → PDF) is built.
- A release-readiness review on 2026-09-23 ([release-review-2026-09-23.md](../reviews/release-review-2026-09-23.md))
  cleared security, packaging, and caching issues ahead of a **first public release**.
- Versioning stays at "bump minor for features, patch for fixes" until that public MVP.

### Still to decide

- Target date for the first public release: **not set**.
- Whether saving the layout (the first nice-to-have above) must ship in the first public release.
- Distribution: signed and notarized macOS build, a Windows installer, and whether Linux is supported.

### Constraints

- **Offline and single-user.** No servers, accounts, or running costs.
- **Privacy and safety.** The app can read the user's whole disk and writes EXIF orientation into
  original files, so it must only ever touch recognized image files. It runs with Electron's
  sandbox and a narrow bridge to the system, and it doesn't open arbitrary files or links.
- **Albums refer to files by path.** If a file is moved or renamed outside the app, its album
  entry breaks. That is the trade-off for not importing.
- **Rotation changes the original file's orientation tag**, so other apps will also see the rotation.
- **Installer size** should stay small. Only what the app needs at runtime is shipped. It is now
  about 7 MB of app code plus about 21 MB for exiftool, down from about 219 MB.
- **Performance.** Folders with hundreds of RAW files should scroll smoothly. Thumbnails are
  downscaled and cached on disk, and full resolution is used only for the preview and the PDF.
