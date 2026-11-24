import { browser } from '@wdio/globals';

// iOS versions of the two helpers from test/Support/gesture.ts that the search tests use.
// Same function names, so the iOS spec reads exactly like the Android spec.

// Hide the keyboard if it is open. iOS sometimes refuses (some keyboards have no "hide" key),
// so a failure is ignored: the search results are still readable with the keyboard open.
export async function dismissKeyboard(): Promise<void> {
  try {
    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  } catch {
    // Keyboard could not be hidden. Not a problem for these tests.
  }
}

// Rotate the simulator. Works the same on iOS.
export async function rotate(orientation: 'PORTRAIT' | 'LANDSCAPE'): Promise<void> {
  await browser.setOrientation(orientation);
}
