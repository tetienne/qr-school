# Architecture

## The module boundary

Business logic stays out of the DOM: most of `src/` is plain functions over
names, file names, palettes, and sheet geometry, tested in Node with no DOM and
no disk. `photos.ts` and `labels.ts` are the only files that know about
elements, and disk access goes through an `exists` predicate a test can replace,
never through a handle passed down the call stack. `folder-access.ts` is the
only place that asks whether the browser can write to a folder at all, by
testing for the `showDirectoryPicker` capability, never by checking a browser
name.

## The label sheet

The sheet is laid out in millimetres and cut into pages by `label-layout.ts`, so
no label is ever split by a page break. That geometry assumes the print dialog
is set to A4 at 100 % with the browser's own headers and footers off; the app
says so on the page, and a change to the layout has to keep that assumption
true.

Two pupils called `Léa` are disambiguated by the teacher (`Léa B`, `Léa M`), not
by the app.

## Ink dark enough to decode

A label the decoder cannot read looks perfectly fine on screen: zxing thresholds
on brightness alone, so a pastel QR code stops being decoded while still looking
like a QR code. Every palette in `label-theme.ts` sits under 40 % of the
brightness of white, and a colour picked by hand goes through `readableInk`
first, which darkens it before it ever reaches a label. Canary yellow prints as
mustard on purpose.

Anything touching the appearance of a label, colour, module shape, quiet zone,
size, or the white patch under the code, is a decoding change rather than a
cosmetic one. Photograph it in `photo-reading.test.ts` and check the first name
comes back.

## Decoding a folder of photos

Reading QR codes out of a folder is CPU-bound, and a folder can hold a term's
worth of photos, so `photo-scanning.ts` spreads the work across a pool of
workers running `scan-worker.ts`, one fewer than the core count and never more
than four. Results come back to the page in folder order
whatever the order the workers finish in, because the numbering of the output
files depends on it.

## What is stored, and where

The class list and the label options live in `localStorage` under keys that
still carry the project's former name: `qr-school.names`,
`qr-school.label-options`, `qr-school.size`. They point at data already sitting
in a teacher's browser, so renaming them would silently empty her class list.

Remembered folder handles are not there. A directory handle is a live object
rather than a path, so `folder-memory.ts` keeps it in IndexedDB.
