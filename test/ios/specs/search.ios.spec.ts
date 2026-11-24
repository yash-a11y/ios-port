import { expect } from '@wdio/globals';
import { SamplePage } from '../pages/SamplePage';
import { rotate } from '../support/gesture';

// iOS copy of test/specs/search.spec.ts. Same tests, same steps, same search words.
// Only difference: iOS shows "No results found" where Android shows "No results".
describe('Search tests', () => {
  const page = new SamplePage();

  beforeEach(async () => {
    await rotate('PORTRAIT');
  });

  it('shows the home screen', async () => {
    await page.dismissOnboardingIfShown();
    expect(await page.isHomeNavSectionDisplayed()).toBe(true);
  });

  it('shows a matching result for a known title', async () => {
    await page.dismissOnboardingIfShown();
    await page.searchSectionNavigtion();
    await page.search('Appium');

    const title = await page.firstResultTitle();

    expect(title.toLowerCase()).toContain('appium');
  });

  it('matches a result when the query is lowercase', async () => {
    await page.dismissOnboardingIfShown();
    await page.searchSectionNavigtion();
    await page.search('appium');

    const title = await page.firstResultTitle();

    expect(title.toLowerCase()).toContain('appium');
  });

  it('shows a matching result for a second search term', async () => {
    await page.dismissOnboardingIfShown();
    await page.searchSectionNavigtion();
    await page.search('TypeScript');

    const title = await page.firstResultTitle();

    expect(title.toLowerCase()).toContain('typescript');
  });

  it('negative searching test on invalid numeric input', async () => {
    await page.dismissOnboardingIfShown();
    await page.searchSectionNavigtion();
    await page.search('44444444444444444');

    const message = await page.noResultsMessage();

    expect(message).toBe('No results found');
  });

  it('Negative searching test on invalid special character input', async () => {
    await page.search('#$#*%#');

    const message = await page.noResultsMessage();

    expect(message).toBe('No results found');
  });
});
