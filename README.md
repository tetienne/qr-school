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
   same one again next term.
2. **Photograph.** Label and work in the same frame. A hand-held tilt is fine.
3. **Ranger les photos.** Point the app at a folder of photos, it decodes every
   QR code without sending one anywhere, leaves an editable first-name field on
   the few it could not read, and copies (never moves, never deletes) each photo
   into a per-child folder.

> **The one thing that breaks silently.** A QR code that looks perfectly
> readable on screen can still fail to decode, because a pastel ink stops being
> read while still looking like a QR code to a human eye. Every colour the app
> prints is darkened first. Changing how a label looks is a decoding change, not
> a cosmetic one: see [ink dark enough to decode](docs/architecture.md#ink-dark-enough-to-decode).

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
and Edge have it, Firefox and Safari do not, and Brave ships Chromium but turns
it off ([brave#11407]). Where it is missing, the filing page warns and disables
the destination folder and the per-name subfolders: renamed photos arrive one by
one in Downloads, without subfolders. Nothing in the app asks which browser it
is running in, only whether the capability is there.

[brave#11407]: https://github.com/brave/brave-browser/issues/11407

## Working on it

```bash
npm install
npm run dev       # local server with hot reload
npm run verify    # the gate: format, lint, types, tests, build, browser tests
```

`npm run verify` is what CI runs, and nothing is done until it passes.

- [Architecture](docs/architecture.md): where the module boundary runs, the
  label sheet, the pool of decoding workers, what the app stores.
- [Testing](docs/testing.md): what runs in Node, what needs a browser, and the
  three things only a human can check.
- [Deploying](docs/deploying.md): publishing to GitHub Pages.

## Licence

[MIT](LICENSE).

Two dependencies ship inside the built site under their own terms:

| Bundled                                                                         | Licence    |
| ------------------------------------------------------------------------------- | ---------- |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)           | MIT        |
| [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) wrapper                     | MIT        |
| [zxing-cpp](https://github.com/zxing-cpp/zxing-cpp), inside `zxing_reader.wasm` | Apache-2.0 |

Apache-2.0 asks that its licence text travel with the binary, which is why
`zxing_reader.wasm` is named here rather than left implicit in the lockfile.
