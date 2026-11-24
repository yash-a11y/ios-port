import { $ } from '@wdio/globals';

/**
 * Shared actions for the iOS page objects (same idea as test/pages/BasePage.ts).
 * Here a locator is just a string, because these pages are iOS only.
 *
 * Locator strategies used on iOS (WebdriverIO selector syntax), best first:
 *   Accessibility id          '~Search Field'
 *   iOS predicate string      '-ios predicate string:label == "No results found"'
 *   iOS class chain           (not needed for the search tests)
 */
export abstract class BasePage {
  protected async find(locator: string) {
    return $(locator);
  }

  protected async tap(locator: string): Promise<void> {
    const element = await this.find(locator);
    await element.waitForDisplayed();
    await element.click();
  }

  protected async enterText(locator: string, text: string): Promise<void> {
    const element = await this.find(locator);
    await element.waitForDisplayed();
    await element.setValue(text);
  }

  protected async readText(locator: string): Promise<string> {
    const element = await this.find(locator);
    await element.waitForDisplayed();
    return element.getText();
  }

  protected async isShown(locator: string, timeoutMs = 5000): Promise<boolean> {
    const element = await this.find(locator);
    return element.waitForDisplayed({ timeout: timeoutMs }).then(
      () => true,
      () => false,
    );
  }
}
