# Rolls workspace — Requirements

This document is for people. It explains **why** the Rolls workspace exists, **who** it is for,
**what** it must do, what it deliberately does **not** do, and **why** it is built the way it is.
It extends the app-wide [requirements.md](../requirements.md); read that first. Instructions for
coding agents live in [AGENTS.md](../../../AGENTS.md).

Last updated: 2026-09-24 (draft, not yet built).

---

## 1. Purpose and background

### Why we are building this

Meta Rolls handles photos once they are files on a disk. Film photographers have a whole stretch of
work _before_ that point, and today they track it in notebooks, spreadsheets, or their memory:

- **Which rolls they own**, and which ones are about to expire in the fridge.
- **What is loaded in which camera**, and at what ISO (pushed or pulled).
- **Which lab has which roll**, when it was sent, what it cost, and when it came back.
- **Which folder the scans ended up in**, and which frame was shot with which lens and settings.

When the scans finally arrive, that information is disconnected from the files. The lab's folder
names don't say which stock or camera was used, and the EXIF data in a scan describes the scanner,
not the shot.

### What we want to solve

A place inside Meta Rolls to keep track of **physical film**, from buying a roll to linking its
scans. Rolls records information _about_ rolls. It never imports or copies photos. Once a roll's
scans are linked, those files flow through **Media → Cull → Deliver** like any other photo, and the
roll's details show up next to them.

### Key ideas

| Concept    | Meaning                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- |
| Film stock | A product such as "Kodak Portra 400, 135, 36 exp". Reused across many rolls.             |
| Roll       | One physical roll of a stock. Has a status, a camera, and optionally a default lens.     |
| Dev job    | One trip to a lab (develop and/or scan). A roll can have more than one (e.g. a re-scan). |
| Frame      | One exposure on a roll. Holds optional shot details and, once linked, a scan file.       |
| Gear       | The user's cameras and lenses.                                                           |

A roll moves through five statuses:

| Status       | Vietnamese label | Meaning                            | Date stamped on entry |
| ------------ | ---------------- | ---------------------------------- | --------------------- |
| `unused`     | Chưa chụp        | Bought, not loaded yet             | none                  |
| `loaded`     | Đang chụp        | In a camera                        | `loaded_at`           |
| `shot`       | Chụp xong        | Finished, waiting to go to the lab | `finished_at`         |
| `developing` | Đang tráng       | At the lab                         | dev job `sent_at`     |
| `developed`  | Đã tráng         | Negatives and/or scans returned    | dev job `received_at` |

## 2. Who uses it

### Primary user

The same photographer described in the app-wide requirements, but one who **also shoots film**
(135 and/or 120) and has it developed and scanned at a lab.

- Owns a few film cameras and lenses, and usually has more than one roll on the go: one loaded, one
  at the lab, a few in the fridge.
- Uses local labs and pays in VND, sometimes goes back to the same lab for a re-scan.
- Receives scans as a folder of JPEG or TIFF files, one per frame, named in shooting order.
- Wants to remember what was shot on which stock and camera, without writing it on the canister.
- Prefers English or Vietnamese.

Users who only shoot digital can hide the workspace entirely.

### What frustrates them today

- "I forgot which camera still has film in it."
- "I sent three rolls to the lab and can't remember which one was pushed a stop."
- "The scans came back as `000123.jpg`. Which roll is this even?"
- "I want to know how much I spend on developing, and which lab is fastest."

### Typical session

> Linh buys five rolls of Portra 400 and adds one roll, then duplicates it four times. They load
> one into their Nikon FM2, mark it `loaded`, and set the shot ISO to 800. Rolls shows "+1 push".
> A week later they mark it finished and send it to the lab, filling in the lab name and price in
> the quick form. When the scans arrive by download, Linh enters the received date, clicks
> **Link scans**, picks the folder, checks the preview (37 files, 36 frames, so they add a frame),
> and confirms. They open **Show in Media**, where the folder now carries a film icon and the
> roll's name, and the EXIF panel shows "From roll: Portra 400 @ 800, FM2, 50mm". From there the
> photos go into an album in Cull like any others.

## 3. Features and priorities

### Must have (the workspace doesn't work without these)

**Layout**

- The same shell as the rest of the app: resizable panes, and panels that aren't needed can be
  collapsed.
- **Left:** the roll list, with a section switcher at the top: `Rolls · Gear · Stocks`.
- **Center:** the roll detail, with a header, a development section, and a frame grid.
- **Right:** an inspector for the selected frame, or for several selected frames at once.
- The bottom tab bar gains a tab: `Rolls · Media · Cull · Deliver`.

**Roll list**

- List all rolls grouped by status, with a count in each group header.
- Each row shows the roll name, the stock (brand, name, ISO), the camera, the status, and the most
  relevant date for that status.
- Filter by status, stock, camera, and lab. Search by roll name, stock, or notes.
- Sort by last updated (default), loaded date, or name.
- Create a roll with ⌘/Ctrl+N or a "+" button. Only the stock is required; the status starts as
  `unused`.
- Duplicate a roll with a quantity, for when several rolls of the same stock are bought together.
- Delete a roll after confirming. Deleting a roll never touches any linked files.

**Roll detail**

- An editable roll name. The default is generated (e.g. `2026-014`).
- Fields: stock, camera, default lens, exposures, shot ISO, loaded date, finished date, expiry
  date, notes.
- Exposures defaults to the stock's count and can be changed, because 135 rolls often give 37–38
  frames and 120 rolls vary by camera format.
- Shot ISO defaults to the stock's ISO. When changed, show the push or pull in stops (e.g. "+1
  push").
- A status control that offers the next step (e.g. "Mark as finished") and also lets the user set
  any status directly. Changing status stamps the matching date from §1; the date stays editable.
- A warning, not a block, when the stock's format doesn't match the camera's.

**Development**

- A roll has zero or more dev jobs, newest first.
- Dev job fields: lab name, price (optional), currency, sent date, received date, process, scan
  resolution (optional), notes.
- Lab name autocompletes from labs used before.
- Currency defaults to a Preferences setting (VND out of the box).
- Process defaults to the stock's process (C-41, E-6, or B&W) and can be overridden, e.g. for
  cross-processing.
- Moving a roll to `developing` opens a quick form for a new dev job, which can be skipped.
- Entering a received date offers to move the roll to `developed`.

**Frames**

- Frames are created from the roll's exposure count and shown as a numbered grid.
- Each frame shows its scan's thumbnail once linked, and a numbered placeholder until then.
- Frame fields: aperture, shutter speed, lens (overrides the roll's default), date, location (free
  text), notes, and an "unexposed/blank" flag.
- Select several frames with Shift/⌘-click and edit their shared fields together in the inspector.
- Move between frames with the arrow keys, as in Media.
- Add frames past the exposure count, or remove empty frames at the end.

**Scans**

- A **Link scans** button to choose a folder. Only image formats the app already recognizes are
  used.
- Before linking, preview how files map to frames, in filename order.
- If the file and frame counts differ, show it in the preview and let the user confirm anyway, add
  frames, or cancel.
- After linking, reassign a file to another frame by dragging.
- Unlink the folder, or switch to a different one.
- Linking is read-only: nothing is written to the scan files.
- Flag a linked folder or file that no longer exists, on both the roll and the frame.
- **Show in Media** opens Media at the linked folder.
- In Media's folder tree, a linked folder shows a film icon and the roll's name. Right-clicking a
  folder offers **Link to roll…**.
- In Media and Cull, the EXIF panel shows a **From roll** section for any linked file: stock, shot
  ISO, camera, lens, aperture, and shutter.

**Gear and stocks**

- Create, edit, and archive cameras (brand, model, format, notes).
- Create, edit, and archive lenses (name, focal length, max aperture, mount).
- Create, edit, and archive film stocks (brand, name, ISO, format, exposures, process, and type:
  color negative, slide, or B&W).
- Anything a roll uses can be archived but not deleted. Archived items are hidden from pickers but
  still show on the rolls that use them.
- Pickers support type-to-search and "create new" without leaving the form.

**Across the workspace**

- Works fully offline; all data survives restarts.
- A Preferences setting hides the whole workspace for digital-only users.
- Every screen has a helpful empty state (e.g. "No rolls yet. Add your first roll").
- All text goes through the app's i18n layer, ready for the Vietnamese translation.

### Nice to have (valuable, but not blocking the first version)

- An expiry warning on `unused` rolls that are close to or past their expiry date.
- A summary line above the roll list, e.g. "3 loaded · 2 at lab · 14 in fridge".
- Per-lab totals: how much the user has spent, and how many days a roll usually takes.
- A built-in offline list of common stocks, so the user can pick one without creating it first.

### Not doing this time (and why)

| Not building                                             | Why                                                                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Writing roll or frame details into scan files (EXIF/XMP) | Linking must stay read-only so a scan folder is never changed by accident. Planned for a later phase as an opt-in feature.           |
| Logging frames on location, importing mobile-app logs    | Needs a phone companion or CSV mapping for each app. Entering details after the fact covers the first version.                       |
| Stock inventory with quantities and purchase prices      | Each roll is already one row, so counting `unused` rolls covers "what's in the fridge". Prices and stock levels are a separate tool. |
| Instax film packs                                        | They aren't developed at a lab and have no scans, so they don't fit the roll lifecycle.                                              |
| Importing or copying scans                               | Same promise as the rest of the app: files stay where they are.                                                                      |

## 4. Tools and why we chose them

_Rolls adds no new dependencies. Everything reuses what the app already ships. Correct the (inferred)
reasons when needed._

| Area            | Choice                                           | Why                                                                                                                                               |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storage         | The existing **SQLite database** (`node:sqlite`) | Rolls, dev jobs, frames, and gear are related records that need joins (e.g. "files linked to this frame"). Albums and ratings already live there. |
| Scan thumbnails | The existing **on-disk thumbnail cache**         | Scans are ordinary image files, so they reuse the same resize-and-cache path as Media. No second cache to maintain.                               |
| File formats    | The app's existing **recognized-format list**    | Linking uses the same rules as Media, so a file that links is always a file Media can show.                                                       |
| Missing files   | A check at display time (inferred)               | Links are by path, like albums, so a moved folder must be detected rather than prevented.                                                         |
| Text            | The app's **i18n layer**                         | Keeps Rolls ready for Vietnamese alongside the rest of the app. Status labels are already written in both languages (§1).                         |

## 5. Design direction

- **Same feel as the rest of the app:** quiet, dense, and tool-like, with resizable panes and
  collapsible panels.
- **Status is the main signal.** Grouping the list by status answers "what's in my camera, and what's
  at the lab" at a glance.
- **Frames look like a contact sheet.** A numbered grid that fills with thumbnails as scans are
  linked.
- **Warn, don't block.** Format mismatches, count mismatches, and missing files are shown clearly
  but never stop the user.
- **Keyboard-first where it counts:** ⌘/Ctrl+N for a new roll, arrow keys between frames,
  Shift/⌘-click for multi-select.

## 6. Schedule and constraints

### Where we are

- This is a draft specification. Nothing in the Rolls workspace is built yet.
- It is a new feature, so it will ship as a **minor** version bump.

### Still to decide

- Is `shot` worth keeping as its own status, or should rolls go straight from `loaded` to
  `developing`?
- Should the roll name follow a fixed pattern (year plus a running number) or be free text?
- Should one physical roll shot across two cameras (a mid-roll change) be supported?
- If a lab scans the same frame at two resolutions, should both files link to that frame?
- Target release: **not set**.

### Constraints

- **Offline and single-user**, like the rest of the app.
- **Read-only on scan files.** Linking never writes to or moves a scan.
- **Links are by path.** If a scan folder is moved or renamed outside the app, the link breaks and
  must be flagged. This is the same trade-off albums make for not importing.
- **Deleting never cascades to disk.** Removing a roll, dev job, or frame only removes records.
- **Performance.** A roll's frame grid (up to ~40 frames on 135) should load as fast as a Media
  folder of the same size, using cached thumbnails.
