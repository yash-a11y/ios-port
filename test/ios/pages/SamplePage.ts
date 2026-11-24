import { browser } from '@wdio/globals';
import { BasePage } from './BasePage';
import { dismissKeyboard } from '../support/gesture';

/**
 * iOS version of the search parts of test/pages/SamplePage.ts for the Wikipedia iOS app (org.wikimedia.wikipedia).
 * Same method names as Android, so the iOS search spec is the same as the Android one.
 *
 * Most locators are accessibility ids taken from the app's own source code:
 * WMFComponents/Sources/WMFComponents/Utility/AccessibilityIdentifiers.swift (tag releases/2026.10.13).
 * Lines marked UNVERIFIED have not been checked on a running simulator yet.
 * Confirm them in Appium Inspector or in the page_source XML from a failed run.
 */
export class SamplePage extends BasePage {
  // Home screen. The Explore feed is the home screen on iOS ("Explore View").
  // Some app versions show a "Home" tab instead, so either one counts.
  private readonly home =
    '-ios predicate string:name == "Explore View" OR name == "Root Tab Home Button"';

  // Android: the tab bar label. iOS: the Explore (or Home) button in the tab bar.
  private readonly homeNavSection =
    '-ios predicate string:name == "Root Tab Explore Button" OR name == "Root Tab Home Button"';

  // Welcome screens: the "Skip" and "Next" buttons.
  // Android has two "next" buttons (Forward and Next). iOS has one, so it is used for both.
  private readonly onboardingSkip = '~App Onboarding Skip Button';
  private readonly onboardingNext = '~App Onboarding Next Button';

  // Search tab in the tab bar (Android: 3rd tab icon).
  private readonly searchSection = '~Search Tab Button';

  // The text box you type the search into.
  private readonly searchInput = '~Search Field';

  // Each search result row has the id "Search Result <article title>".
  private readonly matchingResultTitle = '-ios predicate string:name BEGINSWITH "Search Result "';

  // Empty-search message. iOS says "No results found" (Android says "No results").
  private readonly resultTitle = '-ios predicate string:label == "No results found"'; // UNVERIFIED: text is from the app source, element type not checked

  async firstResultTitle(): Promise<string> {
    return this.readText(this.matchingResultTitle);
  }

  async noResultsMessage(): Promise<string> {
    const element = await this.find(this.resultTitle);
    await element.waitForDisplayed();
    await browser.waitUntil(
      async () => (await element.getText()) === 'No results found',
      { timeoutMsg: 'Search did not show the empty-state message' },
    );
    return element.getText();
  }

  async isSearchSectionDisplayed(): Promise<boolean> {
    return this.isShown(this.searchSection);
  }

  // The spelling "Navigtion" matches the Android page, so the specs stay identical.
  async searchSectionNavigtion(): Promise<void> {
    if (await this.isSearchSectionDisplayed()) {
      await this.tap(this.searchSection);
    }
  }

  async isHomeNavSectionDisplayed(): Promise<boolean> {
    return this.isShown(this.homeNavSection);
  }

  // Android taps the "Search Wikipedia" box on the home screen. iOS opens the Search tab.
  async openSearch(): Promise<void> {
    await this.tap(this.searchSection);
  }

  async search(text: string): Promise<void> {
    // A previous search leaves the search field open. Reuse it.
    if (!(await this.isShown(this.searchInput, 1000))) {
      await this.openSearch();
    }

    const input = await this.find(this.searchInput);
    await input.waitForDisplayed();
    await input.clearValue();
    await input.setValue(text);
    await dismissKeyboard();
  }

  // Tap the element if it shows up within the time limit. Returns true if it was tapped.
  // (Android needs a "clickGesture" on the parent here; on iOS a normal tap works.)
  private async tapIfShown(locator: string, timeoutMs: number): Promise<boolean> {
    if (!(await this.isShown(locator, timeoutMs))) {
      return false;
    }
    await this.tap(locator);
    return true;
  }

  async dismissOnboardingIfShown(): Promise<void> {
    for (let step = 0; step < 6; step++) {
      if (await this.isShown(this.home, 1000)) {
        return;
      }
      if (await this.tapIfShown(this.onboardingSkip, 1000)) {
        return;
      }
      const moved = await this.tapIfShown(this.onboardingNext, 1000);
      if (!moved) {
        return;
      }
    }
  }
}
