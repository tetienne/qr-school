// The one thing the app asks for: the moments the note may appear, and the click
// that ends it. It lives here rather than in `npm test` because the count is
// written by the filing page at the end of a real copy, and read back out of
// `localStorage`.

import { expect, test, type Page } from '@playwright/test';
import { useFakeFolders, type PhotoSpec } from './fake-folders';

// Two photos, both readable: this suite is about what the page says after a
// clean run, not about the decoder.
const FOLDER: PhotoSpec[] = [
  { name: 'photo-01.png', firstName: 'Léa' },
  { name: 'photo-02.png', firstName: 'Noé' },
];

const NOTE = '#support-note';

interface Stored {
  runs: number;
  dismissed: boolean;
}

/**
 * Opens the filing page with the count already at `support`. The storage is
 * seeded between two loads because a page needs an origin before it has a
 * `localStorage`, which is how `photos.spec.ts` does it too.
 */
async function openFilingPage(
  page: Page,
  support: Stored,
  refuse: readonly string[] = [],
): Promise<void> {
  await useFakeFolders(page, FOLDER, [], refuse);
  await page.goto('photos.html');
  await page.evaluate((state: Stored) => {
    localStorage.setItem('qr-school.names', 'Léa\nNoé');
    localStorage.setItem('qr-school.support', JSON.stringify(state));
  }, support);
  await page.goto('photos.html');
}

async function fileEverything(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Choisir le dossier des photos' }).click();
  await page.getByRole('button', { name: 'Lire les étiquettes' }).click();
  await expect(page.getByText(/prénoms? reconnus? sur/)).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Choisir le dossier de destination' }).click();
  await page.getByRole('button', { name: 'Copier les photos' }).click();
}

function storedSupport(page: Page): Promise<Stored | null> {
  return page.evaluate(
    () => JSON.parse(localStorage.getItem('qr-school.support') ?? 'null') as Stored | null,
  );
}

let failures: string[] = [];

test.beforeEach(({ page }) => {
  failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
});

test.afterEach(() => {
  expect(failures, 'the page threw').toEqual([]);
});

test('asks for a coffee on the fifth filing, under the report', async ({ page }) => {
  await openFilingPage(page, { runs: 4, dismissed: false });
  await expect(page.locator(NOTE)).toBeHidden();

  await fileEverything(page);
  await expect(page.getByText("2 photos copiées. Et zou, c'est rangé.")).toBeVisible({
    timeout: 60_000,
  });

  const note = page.locator(NOTE);
  await expect(note).toBeVisible();
  await expect(note).toContainText('Zou est gratuit, et le restera.');
  await expect(note.getByRole('link', { name: "m'offrir un café" })).toHaveAttribute(
    'href',
    'https://paypal.me/ThibautE',
  );
  expect(await storedSupport(page)).toEqual({ runs: 5, dismissed: false });
});

test('stays quiet on the filings between its three moments', async ({ page }) => {
  await openFilingPage(page, { runs: 5, dismissed: false });

  await fileEverything(page);
  await expect(page.getByText(/Et zou/)).toBeVisible({ timeout: 60_000 });

  await expect(page.locator(NOTE)).toBeHidden();
  expect(await storedSupport(page)).toEqual({ runs: 6, dismissed: false });
});

test('goes away for good when she closes it', async ({ page }) => {
  await openFilingPage(page, { runs: 14, dismissed: false });

  await fileEverything(page);
  await expect(page.locator(NOTE)).toBeVisible({ timeout: 60_000 });

  await page.getByRole('button', { name: 'Ne plus afficher' }).click();
  await expect(page.locator(NOTE)).toBeHidden();
  expect(await storedSupport(page)).toEqual({ runs: 15, dismissed: true });
});

// The fortieth filing is the last moment the schedule holds. For a browser where
// she closed the note, that moment has to be gone as well — this is the run that
// would prove the dismissal was only skipping one showing.
test('skips the last moment too, in a browser where she closed it', async ({ page }) => {
  await openFilingPage(page, { runs: 39, dismissed: true });

  await fileEverything(page);
  await expect(page.getByText(/Et zou/)).toBeVisible({ timeout: 60_000 });

  await expect(page.locator(NOTE)).toBeHidden();
  expect(await storedSupport(page)).toEqual({ runs: 40, dismissed: true });
});

// The guard that matters most, and the only one no unit test can reach: the
// count lives in the page, and a lost photo must leave it exactly where it was.
test('says nothing over a filing that lost a photo', async ({ page }) => {
  await openFilingPage(page, { runs: 4, dismissed: false }, ['Noé']);

  await fileEverything(page);
  await expect(page.getByText('1 photo copiée, 1 en échec.')).toBeVisible({ timeout: 60_000 });

  await expect(page.locator(NOTE)).toBeHidden();
  // Not counted at all: the next clean filing is still the fifth.
  expect(await storedSupport(page)).toEqual({ runs: 4, dismissed: false });
});
