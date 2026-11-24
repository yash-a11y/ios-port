# iOS Search Tests for the Wikipedia App

## Overview

These files add an iOS copy of your Android `test/specs/search.spec.ts`. The iOS tests have the same `describe` and `it` names, the same steps, and the same search words. They run on the Wikipedia iOS app (bundle id `org.wikimedia.wikipedia`) through GitHub Actions.

Your Android files are not changed. All iOS code lives in its own folder, `test/ios/`. The only change to an existing file is one new line in `package.json`.

**Terms used here**
- **Locator:** the text a test uses to find something on the screen, such as a button.
- **Accessibility id:** a name the app developers give a screen element. In a locator it starts with `~`.
- **Predicate string:** an iOS-only way to find an element by its properties, such as its label.
- **Page object:** a file that holds a screen's locators and actions, so the tests stay short.

## Files and Where to Put Them

Copy each file to the same path in your `mobile-testing` repo.

| File | What it is | New or changed |
| --- | --- | --- |
| `package.json` | Adds `"test:ios": "wdio run config/wdio.ios.conf.ts"` to `scripts` | Changed (one line) |
| `config/wdio.ios.conf.ts` | iOS settings: connects to Appium on the GitHub Mac and runs only `test/ios/specs` | New (replaces the one sent earlier) |
| `test/ios/pages/BasePage.ts` | Shared tap, type, read, and "is it shown" actions | New |
| `test/ios/pages/SamplePage.ts` | Home check, skip welcome screens, open search, search, read results | New |
| `test/ios/support/gesture.ts` | Hide keyboard and rotate | New |
| `test/ios/specs/search.ios.spec.ts` | Copy of `search.spec.ts` | New |

If you added `test/specs/ios/launch.ios.spec.ts` earlier, delete it. It is no longer used.

## How to Run

1. Commit the files above to your `mobile-testing` repo.
2. Make sure `package-lock.json` is committed. The workflow runs `npm ci`, which needs it. If you don't have one, run `npm install --legacy-peer-deps` once on your PC and commit the `package-lock.json` it creates. (`--legacy-peer-deps` is needed because `@wdio/globals` 9 now asks for a newer `expect-webdriverio` than your `package.json` lists.)
3. On GitHub, open your `wikipedia-ios` fork, then **Actions**, then **iOS simulator Appium tests**, then **Run workflow**.
4. Set **What to run** to `typescript`, **tests_repo** to your `mobile-testing` repo, **tests_dir** to `.`, and **test_command** to `npm run test:ios`.
5. When it finishes, download `ios-test-results`. A failed test saves a screenshot in `screenshots/` and the screen's element list in `page_source_ios_<test name>.xml`.

Your Android run does not change: `npm run test:local` still runs only the Android tests.

## Android to iOS Test Mapping

All tests are in `search.ios.spec.ts`, inside `describe('Search tests')`.

| Android test | iOS test | Difference |
| --- | --- | --- |
| shows the home screen | same | None |
| shows a matching result for a known title (`Appium`) | same | None |
| matches a result when the query is lowercase (`appium`) | same | None |
| shows a matching result for a second search term (`TypeScript`) | same | None |
| negative searching test on invalid numeric input (`44444444444444444`) | same | Expects `No results found`, the iOS app's text |
| Negative searching test on invalid special character input (`#$#*%#`) | same | Expects `No results found` |

## Android to iOS Locator Mapping

Locators marked **Confirmed in source** come from the app's own code at tag `releases/2026.10.13`. Locators marked **UNVERIFIED** have not been checked on a running simulator yet.

Reference: https://github.com/wikimedia/wikipedia-ios/blob/releases/2026.10.13/WMFComponents/Sources/WMFComponents/Utility/AccessibilityIdentifiers.swift

| Element | Android locator | iOS locator | Status |
| --- | --- | --- | --- |
| Home screen | `~Search Wikipedia` | `-ios predicate string:name == "Explore View" OR name == "Root Tab Home Button"` | Confirmed in source |
| Home tab (nav section) | `resourceId(".../navigation_bar_item_large_label_view")` | `-ios predicate string:name == "Root Tab Explore Button" OR name == "Root Tab Home Button"` | Confirmed in source |
| Onboarding Skip | `text("Skip")` | `~App Onboarding Skip Button` | Confirmed in source |
| Onboarding Next / Forward | `~Next`, `~Forward` | `~App Onboarding Next Button` (iOS has one button for both) | Confirmed in source |
| Search tab | `resourceId(".../navigation_bar_item_icon_container").instance(2)` | `~Search Tab Button` | Confirmed in source |
| Search box | `resourceId(".../search_src_text")` | `~Search Field` | Confirmed in source |
| First search result | `//*[@resource-id=".../fragment_search_results"]//android.widget.TextView` | `-ios predicate string:name BEGINSWITH "Search Result "` | Confirmed in source |
| No results message | `text("No results")` | `-ios predicate string:label == "No results found"` | UNVERIFIED (text confirmed in source, element not checked) |

## Known Differences from Android

- **Empty search text.** iOS shows "No results found", so the two negative tests expect that text.
- **Opening search.** Android taps the "Search Wikipedia" box. On iOS the Search tab already shows the search box, so the test taps the Search tab.
- **Hiding the keyboard.** iOS sometimes can't hide the keyboard. The helper ignores that, because the results are still readable.
- **Pop-ups.** `autoAcceptAlerts` accepts iOS system pop-ups. If an in-app pop-up covers the screen, check the failure screenshot.
