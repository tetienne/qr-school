# Working in this repository

`docs/` describes how the app is built and tested. What follows is only what an
agent gets wrong without being told.

## Commits and pull requests

Commit subjects and pull request titles follow
[Conventional Commits](https://www.conventionalcommits.org):

```
feat(labels): give each label a colour and a mascot
fix(photos): keep the EXIF orientation of a portrait photo
docs: explain the label palette
```

- Types in use: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
- Scopes follow the page or the module: `labels`, `photos`, `filing`, `qr`.
- The subject is English, lower case, imperative, under ~70 characters.
- The body says _why_ before _what_, wrapped at 80 columns. The diff already
  says what changed; a message that only paraphrases it is worth nothing.
- A pull request title obeys the same rule, and its body covers the whole
  branch, not just the commit it was opened from.

## Language

Code is English, the interface is French: the user is a French primary school
teacher. The boundary runs exactly here:

- identifiers, comments, commit messages, test names, HTML `id`s and CSS class
  names are English;
- every string she can read stays French: page copy, button labels,
  `aria-label`s, placeholders, status messages, and the `Sans-nom` fallback that
  ends up in a file name;
- French stays where it is behaviour rather than prose: `<html lang="fr">`,
  `localeCompare(…, 'fr')`, and the French keys `extractFirstName` accepts
  (`prenom=`, `nom=`), because that is what a French label generator emits.

The `localStorage` keys keep the project's old name (`qr-school.names`,
`qr-school.label-options`, `qr-school.size`, `qr-school.support`). They point at
data already in the teacher's browser; renaming them would silently empty her
class list. New keys take the same prefix on purpose: the older three cannot
move, and one stale name is better than two namespaces in the same storage.

## Two rules in `docs/architecture.md` that are not suggestions

Never branch on a browser name, and treat any change to the appearance of a
label as a decoding change. Both look like preferences and are not.

## Before saying it works

`npm run verify` is the gate; the CI runs the same thing. Nothing is "done"
until it passes.

Tests carry the intent, not just the assertion. Extend a suite rather than
weakening it, and if a test documents a limit that starts passing, that is news
to notice, not a failure to silence. When you add a browser test, break the code
on purpose and check that test, and only that test, goes red: a browser test
that has never failed is not known to work.
