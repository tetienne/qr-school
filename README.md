# Zou

<p align="center">
  <img src="public/og.png" alt="Zou's shared preview card: a printed QR label with a first name and a small mascot, taped to ruled school paper" width="600">
</p>

<p align="center"><em>A QR label next to the work. A photo. Every image lands in the right kid's folder.</em></p>

Zou files photos of pupils' work automatically. A French primary school teacher
prints a QR label carrying a child's first name, sets it next to the work,
photographs the two together, and Zou reads the code back to copy each photo
into a per-child subfolder. No install, no command line, no upload: everything
runs in the browser, and once deployed the app is a bookmark.

The interface is French, because the user is a French primary school teacher.
Code, comments, and this file are English.

## How it works

```
  ┌─────────────────┐      ┌───────────────┐      ┌──────────────────────┐
  │  Print labels   │  ->  │  Take photos  │  ->  │  File the photos     │
  │  name + QR code │      │  label + work │      │  QR decoded in the   │
  │  once a year    │      │  in one frame │      │  browser, sorted by  │
  │                 │      │               │      │  first name          │
  └─────────────────┘      └───────────────┘      └──────────────────────┘
```

1. **Créer les étiquettes.** Type the class list, pick a size and a palette,
   print an A4 sheet. Each label carries the QR code, the first name in plain
   text, and a colour and small drawing derived from the name itself, so a child
   who cannot read yet still finds "the orange label with the fox", and finds the
   same one again next term. Two pupils called `Léa` are disambiguated by the
   teacher (`Léa B`, `Léa M`), not by the app.
2. **Photograph.** Label and work in the same frame. `photo-reading.test.ts`
   holds the decoder to tilts up to 45° on one axis, 35° on two, and in-plane
   rotation.
3. **Ranger les photos.** Point the app at a folder of photos, it decodes every
   QR code client-side across a pool of workers, leaves an editable first-name
   field on the few it could not read, and copies (never moves, never deletes)
   each photo into a per-child folder.

> **The one thing that breaks silently.** A QR code that looks perfectly dark
> and readable on screen can still fail to decode: zxing thresholds on
> brightness alone, so a pastel ink stops being read while still looking like
> a QR code to a human eye. Every palette in `label-theme.ts` sits under 40 %
> of the brightness of white, and any colour a contributor adds must go
> through `readableInk` first. If you touch colour, module shape, quiet zone,
> size, or the white patch under the code, you are making a decoding change:
> prove it in `photo-reading.test.ts`, which photographs a generated label by
> 3D projection and checks the first name comes back.

## Where things live

Business logic stays out of the DOM: most of `src/` is plain functions over
names, file names, palettes, and sheet geometry, tested in Node with no DOM and
no disk. `photos.ts` and `labels.ts` are the only files that know about
elements, and disk access goes through an `exists` predicate a test can
replace, never through a handle passed down the call stack. `folder-access.ts`
is the only place that asks whether the browser can write to a folder at all,
by testing for the `showDirectoryPicker` capability, never by checking a
browser name.

The label sheet is laid out in millimetres and cut into pages by
`label-layout.ts`, so no label is ever split by a page break. That geometry
assumes the print dialog is set to **A4 at 100 %** with the browser's own
headers and footers off; the app says so on the page, and a change to the
layout has to keep that assumption true.

The class list and the label options live in `localStorage` under keys that
still carry the project's former name: `qr-school.names`,
`qr-school.label-options`, `qr-school.size`. They point at data already sitting
in a teacher's browser, so renaming them would silently empty her class list.
Remembered folder handles are not there; a directory handle is a live object
rather than a path, and `folder-memory.ts` keeps it in IndexedDB.

## What it will not do

- **HEIC/HEIF** (the iPhone default) cannot be decoded by the browser; such
  files are listed and flagged. Set the iPhone to "Most Compatible" (JPEG), or
  convert beforehand.
- Only the first QR code found in a photo is used.
- Correcting a first name after the copy re-copies the photo under the new
  name; the earlier copy stays on disk. There is no undo.
- Moving instead of copying is not offered.
- Remembered folders are offered again, never reopened silently: browsers only
  renew access to a folder from inside a click.

## Browsers

Writing straight into a chosen folder needs the File System Access API. Chrome
and Edge have it, Firefox and Safari do not. Where it is missing, the filing
page warns and disables the destination folder and the per-name subfolders:
renamed photos arrive one by one in Downloads, without subfolders. The
capability, `showDirectoryPicker`, is the only thing the code checks, and that
is on purpose: Brave ships Chromium, turns the API off ([brave#11407]), and
appears in no compatibility table at all. `folder-access.ts` asks for
`showDirectoryPicker` and believes the answer.

[brave#11407]: https://github.com/brave/brave-browser/issues/11407

## Running it

```bash
npm install
npm run dev           # local server with hot reload
npm run verify        # format:check, lint, typecheck, all tests, build, browser tests
npm test              # unit tests (Vitest)
npm run test:browser  # browser tests (Playwright), on the built site
npm run build         # static site into dist/
npm run preview       # serve dist/ to check the build
```

`npm run verify` is the gate; CI runs the same thing. The browser tests need
Chromium once: `npx playwright install chromium`.

TypeScript runs in strict mode (including `noUncheckedIndexedAccess`),
Tailwind CSS 4 through its Vite plugin, no UI framework: the DOM is driven
directly. `npm test` covers the plain-function half of `src/`; `npm run
test:browser` covers what needs a real browser (the worker pool, the pages of
the label sheet, writing to a folder), driven against the **built** site
because the worker URL and the `.wasm` path are rewritten at build time.
Three things stay outside any suite and are only ever checked by hand: the
native Windows folder picker, the download fallback for browsers without
folder access, and real camera photos.

## Deploying

Push to GitHub, then `Settings` > `Pages` > _Source_: **GitHub Actions**.
`.github/workflows/deploy.yml` checks formatting, lint and types, runs the
tests, builds, and publishes on every push to `main`; pull requests run the
same checks without deploying. The base path comes from the repository name
(`VITE_BASE`); `npm run dev` serves from the root. HTTPS is mandatory, since
the folder access API does not work over `file://`, and GitHub Pages provides
it.

> **Publishing a branch without merging** replaces what is already online,
> including for the teacher: _Actions_ > _Verify and deploy_ > _Run workflow_ >
> pick the branch. GitHub gates this separately: the branch must be allowed
> under `Settings` > `Environments` > `github-pages` > _Deployment branches
> and tags_, or the job fails with "Branch is not allowed to deploy to github-pages".

## Licence

[MIT](LICENSE), keeping the copyright notice, which ships in three places so
it is hard to lose by accident: `LICENSE`, a banner on each entry chunk of the
build, and the _Code source_ link in the page footer.

Two dependencies ship inside the built site under their own terms:

| Bundled                                                                         | Licence    |
| ------------------------------------------------------------------------------- | ---------- |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)           | MIT        |
| [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) wrapper                     | MIT        |
| [zxing-cpp](https://github.com/zxing-cpp/zxing-cpp), inside `zxing_reader.wasm` | Apache-2.0 |

Apache-2.0 asks that its licence text travel with the binary, which is why
`zxing_reader.wasm` is named here rather than left implicit in the lockfile.
