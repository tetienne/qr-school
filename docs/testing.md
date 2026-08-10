# Testing

```bash
npm test              # unit tests (Vitest), in Node
npm run test:browser  # browser tests (Playwright), on the built site
npm run verify        # everything CI runs
```

The split follows [the module boundary](architecture.md): anything that is a
plain function over names, file names, palettes or geometry is exercised in
Node. TypeScript runs in strict mode (including `noUncheckedIndexedAccess`),
Tailwind CSS 4 goes through its Vite plugin, and there is no UI framework, so
the DOM is driven directly.

Anything the DOM does, the pool of workers, the pages of the label sheet,
writing to a folder, needs a real browser and lives in `tests/`. Those tests
drive the **built** site, not the dev server: the worker URL and the `.wasm`
path are rewritten at build time, so a dev-server run would miss exactly the
breakage they exist for. The browser tests need Chromium once:
`npx playwright install chromium`.

`showDirectoryPicker` opens a native window no test can drive, hence the two
fakes in `tests/fake-folders.ts`: a source drawing its photos from the same QR
matrix the label page uses, and a destination recording what it received.
Nothing binary is committed, and a test label stays one the app would print.

`photo-reading.test.ts` owns the decoder. It builds its fake photos by 3D
projection, because that, not a rotated image, is what a hand-held photo looks
like, and it holds decoding to tilts up to 45° on one axis, 35° on two, plus
in-plane rotation. Extend that suite rather than weakening it, and if a test
documents a limit that starts passing, that is news to notice rather than a
failure to silence.

Three things no suite here covers, so a change touching them is only ever
verified by hand: the native Windows folder picker, the download fallback for
browsers without folder access, and real camera photos.
